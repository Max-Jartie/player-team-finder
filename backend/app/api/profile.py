from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.profile import ProfileSchema

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("/", response_model=ProfileSchema)
async def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """Получение данных своего профиля (Доступно только авторизованным)."""
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Профиль не найден"
        )
    return current_user.profile


@router.put("/", status_code=status.HTTP_200_OK)
async def update_my_profile(
    payload: ProfileSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновление данных профиля с сохранением списка соцсетей в JSONB."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Профиль не найден"
        )

    # Обновляем текстовые и числовые поля
    profile.nickname = payload.nickname
    profile.age = payload.age
    profile.gender = payload.gender
    profile.country = payload.country
    
    # Преобразуем список Pydantic-моделей соцсетей в формат стандартного JSON/Python list[dict]
    profile.social_links = [link.dict() for link in payload.social_links]

    # Сохраняем изменения в PostgreSQL
    db.add(profile)
    db.commit()

    return {"status": "success", "message": "Данные личного кабинета успешно обновлены!"}
