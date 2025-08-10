"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    port: int = int(os.getenv("PORT", 8000))
    
    # Groq API
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_api_key2: str = os.getenv("GROQ_API_KEY2", "")
    
    # Application settings
    max_questions: int = int(os.getenv("MAX_QUESTIONS", 15))
    min_questions: int = int(os.getenv("MIN_QUESTIONS", 3))
    
    # CORS
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "*")
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
