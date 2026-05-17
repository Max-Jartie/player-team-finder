import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = BASE_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent

# Загружаем .env и из корня backend, и из корня репозитория.
# Это помогает и при локальном запуске, и при деплое из разных рабочих директорий.
load_dotenv(PROJECT_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env")


def _normalize_database_url(url: Optional[str]) -> str:
    if not url:
        raise RuntimeError(
            "DATABASE_URL is not configured. "
            "Set DATABASE_URL in environment variables or in backend/.env."
        )

    # Некоторые PaaS-платформы отдают URL в старом формате postgres://,
    # а SQLAlchemy 2.x ожидает postgresql://.
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)

    return url


def _parse_cors_origins(value: Optional[str]) -> List[str]:
    if not value:
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    return [origin.strip() for origin in value.split(",") if origin.strip()]


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback_secret_key")
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24))
    )
    DATABASE_URL: str = _normalize_database_url(os.getenv("DATABASE_URL"))
    CORS_ORIGINS: List[str] = _parse_cors_origins(os.getenv("CORS_ORIGINS"))


settings = Settings()
