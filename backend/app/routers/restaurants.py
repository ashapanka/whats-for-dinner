"""
Restaurant API endpoints.
These are the URLs that Angular will call to get restaurant data.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create router for restaurant endpoints
router = APIRouter()

# Get Google Places API key from environment
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

class Restaurant:
    """Data structure for restaurant information"""
    def __init__(self, place_data: dict):
        self.id = place_data.get("place_id", "")
        self.name = place_data.get("name", "Unknown")
        self.address = place_data.get("vicinity", "Address not available")
        self.rating = place_data.get("rating")
        self.price_level = place_data.get("price_level")
        self.is_open = None
        
        # Check if currently open
        opening_hours = place_data.get("opening_hours")
        if opening_hours:
            self.is_open = opening_hours.get("open_now")
        
        # Get photo URL if available
        photos = place_data.get("photos", [])
        if photos:
            photo_reference = photos[0].get("photo_reference")
            if photo_reference:
                self.photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_PLACES_API_KEY}"
        
        # Get phone number (requires additional API call, so we'll skip for now)
        self.phone_number = None

    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "rating": self.rating,
            "priceLevel": self.price_level,
            "isOpen": self.is_open,
            "photoUrl": getattr(self, 'photo_url', None),
            "phoneNumber": self.phone_number
        }

@router.get("/restaurants/nearby")
async def find_nearby_restaurants(
    latitude: float = Query(..., description="Latitude coordinate"),
    longitude: float = Query(..., description="Longitude coordinate"), 
    radius: int = Query(2000, description="Search radius in meters")
):
    """
    Find restaurants near the given coordinates.
    This is the endpoint Angular calls: GET /api/restaurants/nearby
    """
    
    if not GOOGLE_PLACES_API_KEY:
        raise HTTPException(status_code=500, detail="Google Places API key not configured")
    
    # Google Places API endpoint
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    # Parameters for Google Places API
    params = {
        "location": f"{latitude},{longitude}",
        "radius": radius,
        "type": "restaurant",
        "key": GOOGLE_PLACES_API_KEY
    }
    
    try:
        # Call Google Places API
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise exception for bad status codes
        
        data = response.json()
        
        # Check if API call was successful
        if data.get("status") != "OK":
            raise HTTPException(status_code=400, detail=f"Google Places API error: {data.get('status')}")
        
        # Convert Google's data to our format
        restaurants = []
        for place in data.get("results", []):
            restaurant = Restaurant(place)
            restaurants.append(restaurant.to_dict())
        
        return {
            "restaurants": restaurants,
            "status": "OK"
        }
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch restaurants: {str(e)}")

@router.get("/restaurants/search")
async def search_restaurants_by_location(
    location: str = Query(..., description="Location to search (e.g., 'New York, NY')")
):
    """
    Search restaurants by location name.
    This is for manual location input when geolocation fails.
    """
    
    if not GOOGLE_PLACES_API_KEY:
        raise HTTPException(status_code=500, detail="Google Places API key not configured")
    
    # First, geocode the location to get coordinates
    geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
    geocode_params = {
        "address": location,
        "key": GOOGLE_PLACES_API_KEY
    }
    
    try:
        # Get coordinates for the location
        geocode_response = requests.get(geocode_url, params=geocode_params)
        geocode_response.raise_for_status()
        geocode_data = geocode_response.json()
        
        if geocode_data.get("status") != "OK" or not geocode_data.get("results"):
            raise HTTPException(status_code=400, detail="Location not found")
        
        # Extract coordinates
        location_data = geocode_data["results"][0]["geometry"]["location"]
        latitude = location_data["lat"]
        longitude = location_data["lng"]
        
        # Now search for restaurants near those coordinates
        return await find_nearby_restaurants(latitude, longitude)
        
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to search restaurants: {str(e)}")