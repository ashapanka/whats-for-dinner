"""
Main FastAPI application module.
"""
from fastapi import FastAPI

app = FastAPI(
    title="What's for Dinner API",
    description="API for meal planning and recipe suggestions",
    version="0.1.0"
)


@app.get("/")
async def root():
    """Root endpoint returning a welcome message."""
    return {"message": "Welcome to What's for Dinner API"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

