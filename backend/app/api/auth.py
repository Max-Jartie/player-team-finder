from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.profile import Profile
from app.schemas.auth import AuthRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: AuthRequest, db: Session = Depends(get_db)):
    # 1. Проверяем дубликат Email
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с такой электронной почтой уже зарегистрирован."
        )
    
    # 2. Хэшируем именно чистый пароль пользователя (payload.password)
    hashed_pwd = hash_password(payload.password)
    
    new_user = User(email=payload.email, password=hashed_pwd)
    db.add(new_user)
    db.flush()  
    
    # Извлекаем никнейм из почты
    default_nickname = payload.email.split("@")[0]
    
    # 3. Создаем базовый пустой профиль в ЛК
    new_profile = Profile(
        user_id=new_user.id,
        nickname=default_nickname,
        age=11,  
        gender="male",
        country="RU"
    )
    db.add(new_profile)
    db.commit()
    
    return {"status": "success", "message": "Вы успешно зарегистрировались!"}


@router.post("/login", response_model=TokenResponse)
async def login(payload: AuthRequest, db: Session = Depends(get_db)):
    # 1. Ищем пользователя по Email
    user = db.query(User).filter(User.email == payload.email).first()
    
    # 2. Проверяем пароль (сравниваем чистый ввод payload.password с хэшем из БД)
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверная электронная почта или пароль."
        )

    if user.is_banned:
        reason = user.ban_reason or "не указана"
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Ваш аккаунт заблокирован. Причина: {reason}",
        )
    
    token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "is_admin": user.is_admin}
    )
    
    # Обновляем время визита
    if user.profile:
        db.add(user.profile)  
        db.commit()
        
    return {"access_token": token, "token_type": "bearer"}
