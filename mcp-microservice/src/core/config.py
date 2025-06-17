from pydantic import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str | None = None
    observer_service_url: str = "http://localhost:8010/register"
    port: int = 8015

    class Config:
        env_file = ".env"

settings = Settings()
