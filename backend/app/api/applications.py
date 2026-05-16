from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Game, Application
from app.schemas.application import (
    ApplicationCreate, ApplicationResponse, ApplicationUpdate,
    CS2Data, Dota2Data, ValorantData, DefaultGameData
)

router = APIRouter(prefix="/applications", tags=["Player Applications"])


def _validate_game_specific_data(game_slug: str, game_specific_data: dict) -> dict:
    try:
        if game_slug == "cs2":
            return CS2Data(**game_specific_data).dict()
        if game_slug == "dota2":
            return Dota2Data(**game_specific_data).dict()
        if game_slug == "valorant":
            return ValorantData(**game_specific_data).dict()
        return DefaultGameData(**game_specific_data).dict()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Ошибка валидации параметров игры: {str(e)}"
        )

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создание заявки с динамической валидацией JSONB блока под каждую игру."""
    game = db.query(Game).filter(Game.slug == payload.game_slug, Game.is_active == True).first()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Указанная игра не поддерживается.")

    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Сначала заполните профиль в Личном Кабинете.")

    validated_data = _validate_game_specific_data(payload.game_slug, payload.game_specific_data)

    new_app = Application(
        profile_id=current_user.profile.id,
        game_id=game.id,
        description=payload.description,
        game_data=validated_data
    )
    db.add(new_app)
    db.commit()

    return {"status": "success", "message": "Ваше объявление успешно опубликовано!"}


@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(
    game_slug: str = Query(..., description="Системное имя игры (cs2, dota2...)"),
    age_from: int = Query(None, description="Минимальный возраст (ОТ)"),
    age_to: int = Query(None, description="Максимальный возраст (ДО)"),
    gender: str = Query(None, description="Пол игрока (male, female)"),
    country: str = Query(None, description="Код страны (RU, BY...)"),
    db: Session = Depends(get_db)
):
    from app.models.profile import Profile
    from app.models.application import Game, Application

    query = db.query(Application).join(Application.game).join(Profile)
    
    query = query.filter(Game.slug == game_slug, Application.status == "active")
# фильтры
    if age_from and age_from > 10:
        query = query.filter(Profile.age >= age_from)

    if age_to and age_to > 10:
        query = query.filter(Profile.age <= age_to)

    if gender:
        query = query.filter(Profile.gender == gender)

    if country:
        query = query.filter(Profile.country == country)

    query = query.order_by(Application.updated_at.desc())

    apps = query.all()
    for app in apps:
        app.game_slug = app.game.slug
        app.author = app.profile
        app.author.user_id = app.profile.user_id

    return apps


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_single_application(
    app_id: int,
    db: Session = Depends(get_db)
):
    """Получение одной конкретной заявки по ID для детального просмотра."""
    app = db.query(Application).filter(Application.id == app_id, Application.status == "active").first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Объявление не найдено или было удалено автором."
        )
    
    app.game_slug = app.game.slug
    app.author = app.profile
    app.author.user_id = app.profile.user_id
    return app


@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Редактирование собственного объявления (ник, статистика, описание)."""
    app = db.query(Application).filter(Application.id == app_id, Application.status == "active").first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Объявление не найдено или было удалено автором."
        )

    if not app.profile or app.profile.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете редактировать только свои объявления."
        )

    game_slug = app.game.slug
    validated_data = _validate_game_specific_data(game_slug, payload.game_specific_data)

    app.description = payload.description
    app.game_data = validated_data
    app.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(app)

    app.game_slug = game_slug
    app.author = app.profile
    app.author.user_id = app.profile.user_id
    return app
