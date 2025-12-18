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
