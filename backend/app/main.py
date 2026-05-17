import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.applications import router as applications_router
from app.api.games import router as games_router
from app.api.admin import router as admin_router


app = FastAPI(
    title="Team Finder API",
    description="Бэкенд-платформа для поиска игроков и команд (CS2, Dota 2, Valorant)",
    version="1.0.0",
)

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(profile_router, prefix="/api/v1")
app.include_router(games_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "status": "success",
        "message": "Добро пожаловать на Team Finder API! Сервер успешно запущен.",
    }