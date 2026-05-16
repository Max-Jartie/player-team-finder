from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any

class SocialLinkSchema(BaseModel):
    type: str = Field(..., description="Тип соцсети (telegram, discord, steam, vk)")
    value: str = Field(..., description="Никнейм или ссылка на профиль")

class ProfileSchema(BaseModel):
    nickname: str = Field(..., min_length=2, max_length=50)
    age: int
    gender: str = Field(..., description="male / female")
    country: str = Field(..., min_length=2, max_length=2, description="Код ISO, например RU")
    social_links: List[SocialLinkSchema]

    @validator("age")
    def check_age(cls, v):
        if v <= 10:
            raise ValueError("Возраст должен быть строго больше 10 лет")
        return v

    class Config:
        from_attributes = True
