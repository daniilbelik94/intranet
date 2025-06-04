from pydantic_settings import BaseSettings
from pydantic import EmailStr # Для валидации email

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Intranet API - Apple Style"

    # Database
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./backend/intranet.db"

    # JWT
    SECRET_KEY: str = "a_very_secret_key_that_should_be_changed_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # First Superuser (для создания при инициализации БД)
    FIRST_SUPERUSER_EMAIL: EmailStr = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "changethis"
    FIRST_SUPERUSER_FULL_NAME: str = "Admin User"

    class Config:
        case_sensitive = True
        # env_file = ".env" # Если вы хотите использовать .env файл

settings = Settings() 