from pydantic import BaseModel, EmailStr, Field

# Схема, которую присылает фронтенд при регистрации и входе
class AuthRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Пароль не менее 8 символов")

# Схема ответа при успешном входе
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
