import re
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Dict, Any, List


class CS2Data(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)
    csstats_url: str

    @field_validator("csstats_url")
    @classmethod
    def validate_csstats(cls, v: str) -> str:
        pattern = r"^https?://(www\.)?csstats\.gg/([a-zA-Z-]+/)?player/\d+"
        if not re.match(pattern, v):
            raise ValueError("Ссылка должна вести на профиль csstats.gg")
        return v


class Dota2Data(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)
    dotabuff_url: str

    @field_validator("dotabuff_url")
    @classmethod
    def validate_dotabuff(cls, v: str) -> str:
        pattern = r"^https?://([a-zA-Z-]+\.)?dotabuff\.com/players/\d+"
        if not re.match(pattern, v):
            raise ValueError("Ссылка должна вести на профиль dotabuff.com")
        return v


class ValorantData(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)
    tracker_gg_url: str

    @field_validator("tracker_gg_url")
    @classmethod
    def validate_tracker(cls, v: str) -> str:
        pattern = r"^https?://(www\.)?tracker\.gg/valorant/profile/(riot|steam|psn|xbox)/.+"
        if not re.match(pattern, v):
            raise ValueError("Ссылка должна вести на профиль tracker.gg")
        return v


class DefaultGameData(BaseModel):
    ingame_nickname: str = Field(..., min_length=2, max_length=50)



class ApplicationCreate(BaseModel):
    game_slug: str
    description: str = Field(..., min_length=10, max_length=1000)
    game_specific_data: Dict[str, Any]


class ApplicationUpdate(BaseModel):
    description: str = Field(..., min_length=10, max_length=1000)
    game_specific_data: Dict[str, Any]


class ApplicationAuthorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    nickname: str
    age: int
    gender: str
    country: str
    social_links: List[Any]


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    game_slug: str
    game_data: Dict[str, Any]
    author: ApplicationAuthorResponse
