import re
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Dict, Any, List
from app.schemas.profile import ProfileSchema

# валидации ссылок
class CS2Data(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)
    csstats_url: str

    @validator("csstats_url")
    def validate_csstats(cls, v):
        pattern = r"^https?://(www\.)?csstats\.gg/([a-zA-Z-]+/)?player/\d+"
        if not re.match(pattern, v):
            raise ValueError("Ссылка должна вести на профиль игрока на сайте csstats.gg")
        return v

class Dota2Data(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)
    dotabuff_url: str

    @validator("dotabuff_url")
    def validate_dotabuff(cls, v):
        pattern = r"^https?://([a-zA-Z-]+\.)?dotabuff\.com/players/\d+"
        if not re.match(pattern, v):
            raise ValueError("Ссылка должна вести на профиль игрока на сайте dotabuff.com")
        return v

class ValorantData(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)
    tracker_gg_url: str

    @validator("tracker_gg_url")
    def validate_tracker(cls, v):
        pattern = r"^https?://(www\.)?tracker\.gg/valorant/profile/(riot|steam|psn|xbox)/.+"
        if not re.match(pattern, v):
            raise ValueError("Ссылка должна вести на профиль игрока на сайте tracker.gg")
        return v

class DefaultGameData(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)

class ApplicationCreate(BaseModel):
    game_slug: str
    description: str = Field(..., min_length=10, max_length=1000)
    game_specific_data: Dict[str, Any]

class ApplicationAuthorResponse(BaseModel):
    user_id: int
    nickname: str
    age: int
    gender: str
    country: str
    social_links: List[Any]

    class Config:
        from_attributes = True

class ApplicationUpdate(BaseModel):
    description: str = Field(..., min_length=10, max_length=1000)
    game_specific_data: Dict[str, Any]

class ApplicationResponse(BaseModel):
    id: int
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    game_slug: str
    game_data: Dict[str, Any]
    author: ApplicationAuthorResponse

    class Config:
        from_attributes = True
