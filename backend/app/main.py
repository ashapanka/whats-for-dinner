"""
Main FastAPI application.
This is where we define our API endpoints that Angular will call.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import restaurants

# Create the FastAPI app
app = FastAPI(
    title="WhatsForDinner Backend",
    description="Backend API for restaurant search",
    version="1.0.0"
)

# Enable CORS so Angular (localhost:4200) can call this API (localhost:3001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow GET, POST, etc.
    allow_headers=["*"],  # Allow all headers
)

# Include restaurant routes (this adds /api/restaurants/* endpoints)
app.include_router(restaurants.router, prefix="/api")

# Health check endpoint - test if server is running
@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "Backend server is running"}