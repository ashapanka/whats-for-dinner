"""
Integration tests for the FastAPI application.
These tests make real API calls to external services (Overpass API).
They are slower than unit tests and should be run less frequently.

Run all integration tests:
    pytest tests/test_integration.py -v -s

Run a specific integration test:
    pytest tests/test_integration.py::test_real_overpass_api_new_york -v -s
"""
import pytest
from fastapi import status


@pytest.mark.integration
def test_real_overpass_api_new_york(client):
    """
    Integration test: Real call to Overpass API for Times Square, NYC.
    This tests if the Overpass API is actually working.
    
    Run with: pytest tests/test_integration.py::test_real_overpass_api_new_york -v -s
    """
    response = client.post(
        "/api/restaurants/search",
        json={
            "latitude": 40.7580,  # Times Square, NYC
            "longitude": -73.9855,
            "radius": 1000,
            "preferences": []
        }
    )
    
    print(f"\nStatus Code: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")
    print(f"Total Results: {data.get('total_results', 0)}")
    print(f"Status: {data.get('status')}")
    
    if data.get('restaurants'):
        print(f"\nFirst 3 restaurants:")
        for restaurant in data['restaurants'][:3]:
            print(f"  - {restaurant['name']} ({restaurant.get('vicinity', 'N/A')})")
    
    assert response.status_code == status.HTTP_200_OK
    assert "restaurants" in data
    assert "status" in data
    assert "total_results" in data
    
    # Times Square should have MANY restaurants
    assert data["total_results"] > 0, "Times Square should have restaurants!"
    assert len(data["restaurants"]) > 0


@pytest.mark.integration
def test_real_overpass_api_user_location(client):
    """
    Integration test: Test with coordinates that might be failing.
    Use this to test YOUR actual location coordinates.
    
    Run with: pytest tests/test_integration.py::test_real_overpass_api_user_location -v -s
    
    REPLACE the latitude/longitude below with the coordinates from your browser console!
    """
    # TODO: Replace these with the coordinates from your browser console
    response = client.post(
        "/api/restaurants/search",
        json={
            "latitude": 40.7128,  # Replace with your actual latitude
            "longitude": -74.0060,  # Replace with your actual longitude
            "radius": 1000,
            "preferences": []
        }
    )
    
    print(f"\nStatus Code: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")
    print(f"Total Results: {data.get('total_results', 0)}")
    print(f"Status: {data.get('status')}")
    
    if data.get('restaurants'):
        print(f"\nRestaurants found:")
        for restaurant in data['restaurants']:
            print(f"  - {restaurant['name']} ({restaurant.get('vicinity', 'N/A')})")
    else:
        print("\nNo restaurants found at this location.")
        print("This could mean:")
        print("  1. There really are no restaurants within 1000m")
        print("  2. The Overpass API is having issues")
        print("  3. The coordinates are incorrect")
    
    assert response.status_code == status.HTTP_200_OK
    assert "restaurants" in data
    assert "status" in data

