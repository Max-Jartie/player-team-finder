from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import datetime
from typing import Dict, Any, List, Optional

class BanUserRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500, description="Причина блокировки пользователя")


class GameCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=100, description="Название игры")
    slug: str = Field(
        ..., 
        min_length=2, 
        max_length=50, 
        pattern=r"^[a-z0-9_-]+$", 
        description="Системный идентификатор (slug) маленькими буквами"
    )


class AdminProfileBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nickname: str
    age: int
    gender: str
    country: str
    social_links: List[Any]


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    created_at: datetime
    is_admin: bool
    is_banned: bool
    ban_reason: Optional[str] = None
    profile: Optional[AdminProfileBrief] = None


class AdminApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    game_slug: str
    game_data: Dict[str, Any]
    author: AdminProfileBrief
