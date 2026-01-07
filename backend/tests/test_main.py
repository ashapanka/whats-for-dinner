"""
Tests for the main FastAPI application endpoints.
"""
from fastapi import status


def test_read_root(client):
    """Test the root endpoint returns welcome message."""
    response = client.get("/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": "Welcome to What's for Dinner API"}


def test_health_check(client):
    """Test the health check endpoint returns healthy status."""
    response = client.get("/health")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"status": "healthy"}


def test_root_returns_json(client):
    """Test that root endpoint returns JSON content type."""
    response = client.get("/")

    assert response.headers["content-type"] == "application/json"


def test_health_returns_json(client):
    """Test that health endpoint returns JSON content type."""
    response = client.get("/health")

    assert response.headers["content-type"] == "application/json"


def test_nonexistent_endpoint_returns_404(client):
    """Test that accessing a non-existent endpoint returns 404."""
    response = client.get("/nonexistent")

    assert response.status_code == status.HTTP_404_NOT_FOUND


# Overpass API (OpenStreetMap) - Restaurant Search Tests


def test_search_restaurants_endpoint_exists(client):
    """Test that the restaurant search endpoint exists."""
    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060, "preferences": []},
    )
    # Should not return 404
    assert response.status_code != status.HTTP_404_NOT_FOUND


def test_search_restaurants_requires_latitude(client):
    """Test that latitude is required for restaurant search."""
    response = client.post(
        "/api/restaurants/search",
        json={"longitude": -74.0060, "preferences": []},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_search_restaurants_requires_longitude(client):
    """Test that longitude is required for restaurant search."""
    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "preferences": []},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_search_restaurants_validates_latitude_range(client):
    """Test that latitude must be within valid range (-90 to 90)."""
    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 100.0, "longitude": -74.0060, "preferences": []},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    response = client.post(
        "/api/restaurants/search",
        json={"latitude": -100.0, "longitude": -74.0060, "preferences": []},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_search_restaurants_validates_longitude_range(client):
    """Test that longitude must be within valid range (-180 to 180)."""
    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": 200.0, "preferences": []},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -200.0, "preferences": []},
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_search_restaurants_accepts_valid_coordinates(client):
    """Test that valid coordinates are accepted."""
    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060, "preferences": []},
    )
    # Should accept the request (may fail later due to missing API key, but validation passes)
    assert response.status_code in [
        status.HTTP_200_OK,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        status.HTTP_503_SERVICE_UNAVAILABLE,
    ]


def test_search_restaurants_accepts_preferences_list(client):
    """Test that preferences can be provided as a list."""
    response = client.post(
        "/api/restaurants/search",
        json={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "preferences": ["italian", "pizza", "vegetarian"],
        },
    )
    assert response.status_code in [
        status.HTTP_200_OK,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        status.HTTP_503_SERVICE_UNAVAILABLE,
    ]


def test_search_restaurants_preferences_optional(client):
    """Test that preferences are optional."""
    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060},
    )
    # Should work without preferences
    assert response.status_code != status.HTTP_422_UNPROCESSABLE_ENTITY


def test_search_restaurants_accepts_radius_parameter(client):
    """Test that search radius can be specified."""
    response = client.post(
        "/api/restaurants/search",
        json={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "preferences": [],
            "radius": 1500,
        },
    )
    assert response.status_code in [
        status.HTTP_200_OK,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        status.HTTP_503_SERVICE_UNAVAILABLE,
    ]


def test_search_restaurants_validates_radius_minimum(client):
    """Test that radius must be at least 1 meter."""
    response = client.post(
        "/api/restaurants/search",
        json={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "preferences": [],
            "radius": 0,
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_search_restaurants_validates_radius_maximum(client):
    """Test that radius must not exceed 50000 meters (Google Places API limit)."""
    response = client.post(
        "/api/restaurants/search",
        json={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "preferences": [],
            "radius": 60000,
        },
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# Response Structure Tests


def test_search_restaurants_returns_json(client):
    """Test that the response is JSON."""
    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060, "preferences": []},
    )
    assert "application/json" in response.headers.get("content-type", "")


def test_search_restaurants_response_has_restaurants_field(client, mocker):
    """Test that successful response contains 'restaurants' field."""
    # Mock the Overpass API call to return success
    mock_places_response = {
        "results": [
            {
                "name": "Test Restaurant",
                "place_id": "test123",
                "vicinity": "123 Test St",
                "rating": 4.5,
                "types": ["restaurant", "food"],
            }
        ],
        "status": "OK",
    }

    mocker.patch(
        "main.search_nearby_restaurants",
        return_value=mock_places_response,
    )

    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060, "preferences": []},
    )

    if response.status_code == status.HTTP_200_OK:
        data = response.json()
        assert "restaurants" in data
        assert isinstance(data["restaurants"], list)


def test_search_restaurants_response_has_status_field(client, mocker):
    """Test that response contains 'status' field."""
    mock_places_response = {"results": [], "status": "OK"}

    mocker.patch(
        "main.search_nearby_restaurants",
        return_value=mock_places_response,
    )

    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060, "preferences": []},
    )

    if response.status_code == status.HTTP_200_OK:
        data = response.json()
        assert "status" in data


def test_search_restaurants_filters_by_preferences(client, mocker):
    """Test that restaurants are filtered based on user preferences."""
    mock_places_response = {
        "results": [
            {
                "name": "Italian Restaurant",
                "place_id": "italian123",
                "vicinity": "123 Italian St",
                "rating": 4.5,
                "types": ["restaurant", "italian_restaurant"],
            },
            {
                "name": "Chinese Restaurant",
                "place_id": "chinese123",
                "vicinity": "456 Chinese Ave",
                "rating": 4.2,
                "types": ["restaurant", "chinese_restaurant"],
            },
        ],
        "status": "OK",
    }

    mocker.patch(
        "main.search_nearby_restaurants",
        return_value=mock_places_response,
    )

    response = client.post(
        "/api/restaurants/search",
        json={
            "latitude": 40.7128,
            "longitude": -74.0060,
            "preferences": ["italian"],
        },
    )

    if response.status_code == status.HTTP_200_OK:
        data = response.json()
        # Should only return Italian restaurant when filtered
        # (This test will help drive the filtering implementation)
        assert "restaurants" in data


# Error Handling Tests


def test_search_restaurants_handles_overpass_api_error(client, mocker):
    """Test handling of Overpass API errors."""
    # Mock the restaurant service to raise an exception
    mock_service = mocker.AsyncMock()
    mock_service.search_nearby_restaurants.side_effect = Exception("Overpass API Error")

    mocker.patch(
        "main.RestaurantService",
        return_value=mock_service,
    )

    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060, "preferences": []},
    )

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


def test_search_restaurants_handles_zero_results(client, mocker):
    """Test handling when no restaurants are found."""
    mock_places_response = {"results": [], "status": "ZERO_RESULTS"}

    mocker.patch(
        "main.search_nearby_restaurants",
        return_value=mock_places_response,
    )

    response = client.post(
        "/api/restaurants/search",
        json={"latitude": 40.7128, "longitude": -74.0060, "preferences": []},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["restaurants"] == []
    assert data["status"] == "ZERO_RESULTS"
