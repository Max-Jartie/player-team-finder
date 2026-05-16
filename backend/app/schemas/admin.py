from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.game import GameResponse


class AdminProfileBrief(BaseModel):
    nickname: str
    age: int
    gender: str
    country: str

    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    is_admin: bool
    is_banned: bool
    ban_reason: Optional[str] = None
    profile: Optional[AdminProfileBrief] = None

    class Config:
        from_attributes = True


class BanUserRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)


class GameCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-z0-9_-]+$")


class AdminApplicationResponse(BaseModel):
    id: int
    description: str
    status: str
    updated_at: datetime
    game_slug: str
    game_data: Dict[str, Any]
    author_nickname: str
    author_email: str

    class Config:
        from_attributes = True
