from pydantic_settings import BaseSettings 
import os

class Settings(BaseSettings):
   
    DATABASE_URL: str 
    
 
    API_PORT: int = 8000
    JWT_SECRET: str
    JWT_EXPIRES_IN: int = 3600  # seconds
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # minutes (1 hour)
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instance
settings = Settings()

# 🧩 Optional verification
if __name__ == "__main__":
    print("DATABASE_URL:", settings.DATABASE_URL)
    print("DEBUG:", settings.DEBUG)
