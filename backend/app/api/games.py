from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.application import Game, Application
from app.schemas.game import GameResponse

router = APIRouter(prefix="/games", tags=["Games"])


@router.get("/", response_model=List[GameResponse])
async def get_games(
    search: str = Query(None, description="Поиск игры по названию"),
    db: Session = Depends(get_db),
):
    query = db.query(Game).filter(Game.is_active == True)

    if search:
        query = query.filter(Game.title.ilike(f"%{search}%"))

    games = query.all()
    result: list[GameResponse] = []
    for game in games:
        count = (
            db.query(Application)
            .filter(Application.game_id == game.id, Application.status == "active")
            .count()
        )
        result.append(
            GameResponse(
                id=game.id,
                title=game.title,
                slug=game.slug,
                is_active=game.is_active,
                applications_count=count,
            )
        )

    result.sort(key=lambda g: (-g.applications_count, g.title.lower()))
    return result
