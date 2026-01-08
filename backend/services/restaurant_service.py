"""
Restaurant search service using Overpass API (OpenStreetMap).
"""
import asyncio

import httpx
from typing import Optional


class RestaurantService:
    """Service for searching restaurants using Overpass API."""

    # List of public Overpass API servers (fallback options)
    OVERPASS_SERVERS = [
        "https://overpass.kumi.systems/api/interpreter",  # Fast, reliable 
        "https://overpass-api.de/api/interpreter",  # Original official server 
    ]

    def __init__(self, overpass_url: str = None):
        # Use provided URL or default to the first server
        self.overpass_url = overpass_url or self.OVERPASS_SERVERS[0]
        self.timeout = 60.0  # Increased timeout for slower servers
    
    async def search_nearby_restaurants(
        self,
        latitude: float,
        longitude: float,
        radius: int = 1500,
        preferences: Optional[list[str]] = None
    ) -> dict:
        """
        Search for nearby restaurants using Overpass API.

        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            radius: Search radius in meters (default: 1500)
            preferences: List of cuisine preferences to filter by

        Returns:
            Dictionary with 'results' and 'status' keys
        """
        # Build Overpass QL query
        # Search for nodes and ways tagged as restaurants/cafes/fast_food
        query = f"""
        [out:json][timeout:60];
        (
          node["amenity"~"restaurant|cafe|fast_food"](around:{radius},{latitude},{longitude});
          way["amenity"~"restaurant|cafe|fast_food"](around:{radius},{latitude},{longitude});
        );
        out body;
        >;
        out skel qt;
        """

        # Try primary server first, then fallback servers
        servers_to_try = [self.overpass_url] + [
            s for s in self.OVERPASS_SERVERS if s != self.overpass_url
        ]

        last_error = None

        for server_url in servers_to_try:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        server_url,
                        data={"data": query}
                    )
                    response.raise_for_status()
                    data = response.json()

                # Parse Overpass response
                elements = data.get("elements", [])
                restaurants = self._parse_restaurants(elements, preferences)

                status = "OK" if restaurants else "ZERO_RESULTS"

                return {
                    "results": restaurants,
                    "status": status
                }

            except httpx.TimeoutException as e:
                last_error = f"Timeout from {server_url}: {str(e)}"
                # Try next server
                continue
            except httpx.HTTPStatusError as e:
                if e.response.status_code in [429, 504, 503]:
                    # Rate limit or server overload - try next server
                    last_error = f"Server {server_url} unavailable: {e.response.status_code}"
                    continue
                else:
                    # Other HTTP error - return immediately
                    return {
                        "results": [],
                        "status": "ERROR",
                        "error": str(e)
                    }
            except Exception as e:
                last_error = str(e)
                continue

        # All servers failed
        return {
            "results": [],
            "status": "ERROR",
            "error": f"All Overpass servers failed. Last error: {last_error}"
        }
    
    def _parse_restaurants(
        self,
        elements: list[dict],
        preferences: Optional[list[str]] = None
    ) -> list[dict]:
        """
        Parse Overpass API elements into restaurant objects.
        
        Args:
            elements: List of OSM elements from Overpass API
            preferences: Optional list of cuisine preferences to filter by
        
        Returns:
            List of restaurant dictionaries
        """
        restaurants = []
        
        for element in elements:
            # Only process nodes and ways (not relations)
            if element.get("type") not in ["node", "way"]:
                continue
            
            tags = element.get("tags", {})
            
            # Skip if no name
            if "name" not in tags:
                continue
            
            # Extract restaurant data
            restaurant = {
                "name": tags.get("name", "Unknown"),
                "place_id": f"osm_{element.get('type')}_{element.get('id')}",
                "vicinity": self._build_address(tags),
                "rating": None,  # OSM doesn't have ratings
                "types": self._extract_types(tags),
                "user_ratings_total": None,
                "price_level": None,
                "opening_hours": tags.get("opening_hours"),
                "cuisine": tags.get("cuisine", "").split(";") if tags.get("cuisine") else [],
                "phone": tags.get("phone"),
                "website": tags.get("website"),
            }
            
            # Filter by preferences if provided
            if preferences and not self._matches_preferences(restaurant, preferences):
                continue
            
            restaurants.append(restaurant)
        
        return restaurants
    
    def _build_address(self, tags: dict) -> str:
        """Build address string from OSM tags."""
        parts = []
        
        if "addr:housenumber" in tags and "addr:street" in tags:
            parts.append(f"{tags['addr:housenumber']} {tags['addr:street']}")
        elif "addr:street" in tags:
            parts.append(tags["addr:street"])
        
        if "addr:city" in tags:
            parts.append(tags["addr:city"])
        
        return ", ".join(parts) if parts else "Address not available"
    
    def _extract_types(self, tags: dict) -> list[str]:
        """Extract restaurant types from OSM tags."""
        types = []

        amenity = tags.get("amenity")
        if amenity:
            types.append(amenity)

        cuisine = tags.get("cuisine")
        if cuisine:
            types.extend(cuisine.split(";"))

        return types

    def _matches_preferences(self, restaurant: dict, preferences: list[str]) -> bool:
        """
        Check if restaurant matches user preferences.

        Args:
            restaurant: Restaurant dictionary
            preferences: List of preference keywords (e.g., ['italian', 'pizza', 'vegetarian'])

        Returns:
            True if restaurant matches any preference, False otherwise
        """
        if not preferences:
            return True

        # Normalize preferences to lowercase
        normalized_prefs = [p.lower() for p in preferences]

        # Check cuisine
        cuisines = [c.lower() for c in restaurant.get("cuisine", [])]
        for pref in normalized_prefs:
            if any(pref in cuisine for cuisine in cuisines):
                return True

        # Check types
        types = [t.lower() for t in restaurant.get("types", [])]
        for pref in normalized_prefs:
            if any(pref in type_ for type_ in types):
                return True

        # Check name
        name = restaurant.get("name", "").lower()
        for pref in normalized_prefs:
            if pref in name:
                return True

        return False

