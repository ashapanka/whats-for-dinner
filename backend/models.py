"""
Pydantic models for API request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional


class RestaurantSearchRequest(BaseModel):
    """Request model for restaurant search."""
    
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude coordinate",
        examples=[40.7128]
    )
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude coordinate",
        examples=[-74.0060]
    )
    preferences: list[str] = Field(
        default_factory=list,
        description="User food preferences (e.g., 'italian', 'vegetarian')",
        examples=[["italian", "pizza", "vegetarian"]]
    )
    radius: Optional[int] = Field(
        default=1500,
        ge=1,
        le=50000,
        description="Search radius in meters (Google Places API limit: 50000)",
        examples=[1500]
    )


class Restaurant(BaseModel):
    """Model for a single restaurant."""

    name: str = Field(..., description="Restaurant name")
    place_id: str = Field(..., description="Unique place identifier")
    vicinity: str = Field(..., description="Restaurant address/vicinity")
    rating: Optional[float] = Field(None, description="Restaurant rating (0-5)")
    types: list[str] = Field(default_factory=list, description="Restaurant types/categories")
    user_ratings_total: Optional[int] = Field(None, description="Total number of ratings")
    price_level: Optional[int] = Field(None, description="Price level (0-4)")
    opening_hours: Optional[str] = Field(
        None,
        description="Opening hours (e.g., 'Mo-Fr 09:00-18:00')"
    )


class RestaurantSearchResponse(BaseModel):
    """Response model for restaurant search."""
    
    restaurants: list[Restaurant] = Field(
        default_factory=list,
        description="List of restaurants found"
    )
    status: str = Field(
        ...,
        description="Status of the search (OK, ZERO_RESULTS, etc.)"
    )
    total_results: int = Field(
        default=0,
        description="Total number of results found"
    )

