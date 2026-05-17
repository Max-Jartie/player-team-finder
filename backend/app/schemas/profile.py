from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List

class SocialLinkSchema(BaseModel):
    type: str = Field(..., description="Тип соцсети (telegram, discord, steam, vk)")
    value: str = Field(..., description="Никнейм или ссылка на профиль")

# Схема профиля ЛК
class ProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nickname: str = Field(..., min_length=2, max_length=50)
    age: int
    gender: str = Field(..., description="male / female")
    country: str = Field(..., min_length=2, max_length=2, description="Код ISO, например RU")
    social_links: List[SocialLinkSchema]

    @field_validator("age")
    @classmethod
    def check_age(cls, v: int) -> int:
        if v <= 10:
            raise ValueError("Возраст должен быть строго больше 10 лет")
        return v
