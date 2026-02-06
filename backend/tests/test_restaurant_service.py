"""
Unit tests for the RestaurantService class.
These tests mock external API calls and test the service logic in isolation.

Run all unit tests:
    pytest tests/test_restaurant_service.py -v

Run a specific unit test:
    pytest tests/test_restaurant_service.py::test_parse_restaurants_max_results -v
"""
import pytest
from services.restaurant_service import RestaurantService


class TestRestaurantService:
    """Unit tests for RestaurantService."""

    def test_parse_restaurants_max_results_default(self):
        """Test that _parse_restaurants returns maximum 10 results by default."""
        service = RestaurantService()
        
        # Create 20 mock restaurant elements
        elements = []
        for i in range(20):
            elements.append({
                "type": "node",
                "id": i,
                "tags": {
                    "name": f"Restaurant {i}",
                    "amenity": "restaurant",
                    "addr:street": f"Street {i}",
                    "addr:city": "Test City"
                }
            })
        
        # Parse without specifying max_results (should default to 10)
        restaurants = service._parse_restaurants(elements)
        
        # Should return exactly 10 restaurants
        assert len(restaurants) == 10, f"Expected 10 restaurants, got {len(restaurants)}"
        
        # Verify the first 10 restaurants are returned
        for i in range(10):
            assert restaurants[i]["name"] == f"Restaurant {i}"

    def test_parse_restaurants_max_results_custom(self):
        """Test that _parse_restaurants respects custom max_results parameter."""
        service = RestaurantService()
        
        # Create 20 mock restaurant elements
        elements = []
        for i in range(20):
            elements.append({
                "type": "node",
                "id": i,
                "tags": {
                    "name": f"Restaurant {i}",
                    "amenity": "restaurant",
                    "addr:street": f"Street {i}",
                    "addr:city": "Test City"
                }
            })
        
        # Parse with custom max_results=5
        restaurants = service._parse_restaurants(elements, max_results=5)
        
        # Should return exactly 5 restaurants
        assert len(restaurants) == 5, f"Expected 5 restaurants, got {len(restaurants)}"
        
        # Verify the first 5 restaurants are returned
        for i in range(5):
            assert restaurants[i]["name"] == f"Restaurant {i}"

    def test_parse_restaurants_max_results_fewer_than_limit(self):
        """Test that _parse_restaurants returns all results if fewer than max_results."""
        service = RestaurantService()
        
        # Create only 3 mock restaurant elements
        elements = []
        for i in range(3):
            elements.append({
                "type": "node",
                "id": i,
                "tags": {
                    "name": f"Restaurant {i}",
                    "amenity": "restaurant",
                    "addr:street": f"Street {i}",
                    "addr:city": "Test City"
                }
            })
        
        # Parse with max_results=10 (more than available)
        restaurants = service._parse_restaurants(elements, max_results=10)
        
        # Should return all 3 restaurants
        assert len(restaurants) == 3, f"Expected 3 restaurants, got {len(restaurants)}"

    def test_parse_restaurants_max_results_with_filtering(self):
        """Test that max_results applies AFTER filtering by preferences."""
        service = RestaurantService()
        
        # Create 20 mock restaurant elements - 10 Italian, 10 Mexican
        elements = []
        for i in range(10):
            elements.append({
                "type": "node",
                "id": i,
                "tags": {
                    "name": f"Italian Restaurant {i}",
                    "amenity": "restaurant",
                    "cuisine": "italian",
                    "addr:street": f"Street {i}",
                    "addr:city": "Test City"
                }
            })
        for i in range(10, 20):
            elements.append({
                "type": "node",
                "id": i,
                "tags": {
                    "name": f"Mexican Restaurant {i}",
                    "amenity": "restaurant",
                    "cuisine": "mexican",
                    "addr:street": f"Street {i}",
                    "addr:city": "Test City"
                }
            })
        
        # Parse with Italian preference and max_results=5
        restaurants = service._parse_restaurants(
            elements,
            preferences=["italian"],
            max_results=5
        )
        
        # Should return exactly 5 Italian restaurants
        assert len(restaurants) == 5, f"Expected 5 restaurants, got {len(restaurants)}"
        
        # Verify all are Italian
        for restaurant in restaurants:
            assert "Italian" in restaurant["name"]
            assert "italian" in restaurant["cuisine"]

