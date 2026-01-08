"""
Configuration settings for the application.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Overpass API settings (no API key needed!)
    # Using faster alternative server by default
    overpass_api_url: str = "https://overpass.kumi.systems/api/interpreter"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Using lru_cache ensures we only load .env once.
    """
    return Settings()

