from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.application import Application, Game
from app.schemas.admin import (
    AdminUserResponse,
    BanUserRequest,
    GameCreateRequest,
    AdminApplicationResponse,
)
from app.schemas.game import GameResponse

router = APIRouter(prefix="/admin", tags=["Admin Panel"])


@router.get("/users", response_model=List[AdminUserResponse])
async def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    users = db.query(User).options(joinedload(User.profile)).order_by(User.id).all()
    result = []
    for user in users:
        item = AdminUserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            is_admin=user.is_admin,
            is_banned=user.is_banned,
            ban_reason=user.ban_reason,
            profile=user.profile,
        )
        result.append(item)
    return result


@router.post("/users/{user_id}/ban", status_code=status.HTTP_200_OK)
async def ban_user(
    user_id: int,
    payload: BanUserRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден.")
    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя заблокировать самого себя.")
    if user.is_admin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя заблокировать администратора.")

    user.is_banned = True
    user.ban_reason = payload.reason
    db.commit()
    return {"status": "success", "message": "Пользователь заблокирован."}


@router.post("/users/{user_id}/unban", status_code=status.HTTP_200_OK)
async def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден.")
    if not user.is_banned:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь не заблокирован.")

    user.is_banned = False
    user.ban_reason = None
    db.commit()
    return {"status": "success", "message": "Пользователь разблокирован."}


@router.get("/applications", response_model=List[AdminApplicationResponse])
async def list_applications(
    status: Optional[str] = Query(None, description="active, hidden или пусто для всех"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from app.models.profile import Profile

    query = (
        db.query(Application)
        .options(
            joinedload(Application.game),
            joinedload(Application.profile).joinedload(Profile.user),
        )
    )

    if status in ("active", "hidden"):
        query = query.filter(Application.status == status)

    apps = query.order_by(Application.updated_at.desc()).all()

    result = []
    for app in apps:
        author_email = app.profile.user.email if app.profile and app.profile.user else ""
        result.append(
            AdminApplicationResponse(
                id=app.id,
                description=app.description,
                status=app.status,
                updated_at=app.updated_at,
                game_slug=app.game.slug,
                game_data=app.game_data,
                author_nickname=app.profile.nickname if app.profile else "",
                author_email=author_email,
            )
        )
    return result


@router.patch("/applications/{app_id}/hide", status_code=status.HTTP_200_OK)
async def hide_application(
    app_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена.")
    if app.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Скрыть можно только активную заявку.",
        )

    app.status = "hidden"
    db.commit()
    return {"status": "success", "message": "Заявка скрыта."}


@router.delete("/applications/{app_id}", status_code=status.HTTP_200_OK)
async def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заявка не найдена.")
    if app.status != "hidden":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Удалить можно только скрытую заявку.",
        )
    db.delete(app)
    db.commit()
    return {"status": "success", "message": "Заявка удалена."}


@router.get("/games", response_model=List[GameResponse])
async def list_all_games(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    games = db.query(Game).order_by(Game.id).all()
    return [
        GameResponse(
            id=game.id,
            title=game.title,
            slug=game.slug,
            is_active=game.is_active,
            applications_count=db.query(Application)
            .filter(Application.game_id == game.id, Application.status == "active")
            .count(),
        )
        for game in games
    ]


@router.post("/games", response_model=GameResponse, status_code=status.HTTP_201_CREATED)
async def create_game(
    payload: GameCreateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    existing = db.query(Game).filter(Game.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Игра с таким slug уже существует.")

    game = Game(title=payload.title, slug=payload.slug, is_active=True)
    db.add(game)
    db.commit()
    db.refresh(game)
    return GameResponse(
        id=game.id,
        title=game.title,
        slug=game.slug,
        is_active=game.is_active,
        applications_count=0,
    )


@router.put("/games/{game_id}", response_model=GameResponse)
async def toggle_game_active(
    game_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Игра не найдена.")

    game.is_active = not game.is_active
    db.commit()
    db.refresh(game)
    count = db.query(Application).filter(Application.game_id == game.id, Application.status == "active").count()
    return GameResponse(
        id=game.id,
        title=game.title,
        slug=game.slug,
        is_active=game.is_active,
        applications_count=count,
    )
