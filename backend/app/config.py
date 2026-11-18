from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    db_name: str = "apnakarigar"
    jwt_secret: str = "change-me"
    jwt_expire_minutes: int = 60 * 24 * 30  # 30 days: rural users rarely re-login
    upload_dir: str = "uploads"
    max_upload_mb: int = 5
    cors_origins: list[str] = ["*"]
    seed_on_start: bool = True

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
