from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True) # "cs2", "dota2"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    applications: Mapped[list["Application"]] = relationship("Application", back_populates="game")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    profile_id: Mapped[int] = mapped_column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    game_id: Mapped[int] = mapped_column(Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False) # "active", "closed"
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    # Поле автообновления даты изменения заявки
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Динамические параметры игры в формате JSONB: {"ingame_nickname": "Spawn", "csstats_url": "..."}
    game_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # Обратные связи для JOIN-запросов
    profile: Mapped["Profile"] = relationship("Profile", back_populates="applications")
    game: Mapped["Game"] = relationship("Game", back_populates="applications")
