from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    nickname: Mapped[str] = mapped_column(String(50), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    country: Mapped[str] = mapped_column(String(2), nullable=False) # Формат ISO (RU, BY)
    
    # JSONB поле для списка соцсетей: [{"type": "telegram", "value": "@nick"}]
    social_links: Mapped[dict | list] = mapped_column(JSONB, nullable=False, default=list)
    
    # Время последнего визита пользователя
    last_login: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Обратные связи
    user: Mapped["User"] = relationship("User", back_populates="profile")
    applications: Mapped[list["Application"]] = relationship(
        "Application", 
        back_populates="profile", 
        cascade="all, delete-orphan"
    )
