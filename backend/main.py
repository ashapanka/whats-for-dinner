"""
Main FastAPI application module.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from models import Restaurant, RestaurantSearchRequest, RestaurantSearchResponse
from services.restaurant_service import RestaurantService

app = FastAPI(
    title="What's for Dinner API",
    description="API for meal planning and recipe suggestions",
    version="0.1.0"
)

# Configure CORS to allow requests from Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
async def root():
    """Root endpoint returning a welcome message."""
    return {"message": "Welcome to What's for Dinner API"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/api/restaurants/search", response_model=RestaurantSearchResponse)
async def search_restaurants(request: RestaurantSearchRequest):
    """
    Search for nearby restaurants based on location and preferences.

    Args:
        request: Restaurant search request with latitude, longitude, preferences, and radius

    Returns:
        RestaurantSearchResponse with list of restaurants and status

    Raises:
        HTTPException: 500 if service error occurs
    """
    try:
        # Get settings
        settings = get_settings()

        # Create restaurant service
        service = RestaurantService(overpass_url=settings.overpass_api_url)

        # Search for restaurants
        result = await service.search_nearby_restaurants(
            latitude=request.latitude,
            longitude=request.longitude,
            radius=request.radius,
            preferences=request.preferences
        )

        # Check for errors
        if result.get("status") == "ERROR":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Restaurant search failed: {result.get('error', 'Unknown error')}"
            )

        # Parse results into Restaurant models
        restaurants = [
            Restaurant(
                name=r.get("name", "Unknown"),
                place_id=r.get("place_id", ""),
                vicinity=r.get("vicinity", ""),
                rating=r.get("rating"),
                types=r.get("types", []),
                user_ratings_total=r.get("user_ratings_total"),
                price_level=r.get("price_level"),
                opening_hours=r.get("opening_hours")
            )
            for r in result.get("results", [])
        ]

        return RestaurantSearchResponse(
            restaurants=restaurants,
            status=result.get("status", "OK"),
            total_results=len(restaurants)
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

