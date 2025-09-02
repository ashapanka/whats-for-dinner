"""
Main entry point for the backend server.
This file starts the FastAPI application.
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    # Start the server on localhost:3001
    uvicorn.run(
        "app.main:app",  # Points to the 'app' object in app/main.py
        host="0.0.0.0",  # Allow connections from any IP
        port=3001,       # Port 3001 (Angular expects this)
        reload=True      # Auto-restart when code changes
    )