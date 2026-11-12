"""
Unit tests for the RestaurantService class.
These tests mock external API calls and test the service logic in isolation.

Run all unit tests:
    pytest tests/test_restaurant_service.py -v

Run a specific unit test:
    pytest tests/test_restaurant_service.py::test_parse_restaurants_max_results -v
"""
from unittest.mock import AsyncMock, Mock

import pytest
import httpx
from services.restaurant_service import RestaurantService


class TestRestaurantService:
    """Unit tests for RestaurantService."""

    @pytest.mark.asyncio
    async def test_search_identifies_client_to_overpass(self, mocker):
        response = Mock()
        response.json.return_value = {"elements": []}
        client = mocker.MagicMock()
        client.__aenter__.return_value = client
        client.post = AsyncMock(return_value=response)
        async_client = mocker.patch(
            "services.restaurant_service.httpx.AsyncClient",
            return_value=client,
        )

        service = RestaurantService()
        await service.search_nearby_restaurants(40.758, -73.9855)

        assert async_client.call_args.kwargs["headers"] == {
            "User-Agent": RestaurantService.USER_AGENT
        }

    @pytest.mark.asyncio
    async def test_search_fails_over_after_gateway_error(self, mocker):
        first_url = "https://first.example/api/interpreter"
        second_url = "https://second.example/api/interpreter"
        service = RestaurantService(overpass_url=first_url)
        service.OVERPASS_SERVERS = [first_url, second_url]

        first_response = Mock()
        first_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Bad Gateway",
            request=Mock(),
            response=Mock(status_code=502),
        )
        second_response = Mock()
        second_response.json.return_value = {"elements": []}

        clients = []
        for response in (first_response, second_response):
            client = mocker.MagicMock()
            client.__aenter__.return_value = client
            client.post = AsyncMock(return_value=response)
            clients.append(client)

        mocker.patch(
            "services.restaurant_service.httpx.AsyncClient",
            side_effect=clients,
        )

        result = await service.search_nearby_restaurants(40.758, -73.9855)

        assert result["status"] == "ZERO_RESULTS"
        assert [client.post.await_args.args[0] for client in clients] == [
            first_url,
            second_url,
        ]

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

