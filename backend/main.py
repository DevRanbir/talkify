"""
AI-Powered Course Recommendation System Backend
FastAPI application for generating adaptive quiz questions and course recommendations
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from api.routes import router
from config.settings import get_settings

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Talkify Course Recommendation API",
    description="AI-powered system for career guidance and course recommendations",
    version="1.0.0"
)

# Get settings
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {"message": "Talkify Course Recommendation API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is operational"}

@app.get("/key")
async def get_api_key():
    """
    Get the Groq API key for frontend TTS functionality
    
    Returns:
        API key for Groq service
    """
    try:
        settings = get_settings()
        
        if not settings.groq_api_key:
            raise HTTPException(
                status_code=500,
                detail="API key not configured"
            )
        
        return {
            "api_key": settings.groq_api_key,
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching API key: {str(e)}"
        )

@app.get("/key2")
async def get_api_key2():
    """
    Get the second Groq API key for frontend TTS functionality
    
    Returns:
        Second API key for Groq service
    """
    try:
        settings = get_settings()
        
        if not settings.groq_api_key2:
            raise HTTPException(
                status_code=500,
                detail="Second API key not configured"
            )
        
        return {
            "api_key": settings.groq_api_key2,
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching second API key: {str(e)}"
        )

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
