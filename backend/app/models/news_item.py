from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func # Для серверных default таймстемпов
from typing import Optional, List, TYPE_CHECKING # Добавили List, TYPE_CHECKING
from datetime import datetime

from app.db.base_class import Base
# Import User model to resolve ForeignKey reference correctly, assuming it's in app.models.user
from app.models.user import User # Ensure this path is correct

# Импортируем Category и ассоциативную таблицу
if TYPE_CHECKING:
    from .category import Category  # noqa: F401
from .category import news_item_category_association # Прямой импорт таблицы

# Ассоциативная таблица для связи "многие-ко-многим" между NewsItem и Category
# Будет создана позже, когда определим модель Category

class NewsItem(Base):
    __tablename__ = "news_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    
    short_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False) # Предполагаем, что здесь будет HTML
    
    cover_image_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True) # Переименовано с image_url

    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False, index=True) # e.g., "draft", "published"
    
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    author: Mapped["User"] = relationship("User", back_populates="news_items")

    # Связь многие-ко-многим с Category
    categories: Mapped[List["Category"]] = relationship(
        "Category",
        secondary=news_item_category_association,
        back_populates="news_items"
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True) # Устанавливается при публикации
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index('ix_news_items_status', 'status'),
    )


# Add to User model (in user.py) later:
# news_items = relationship("NewsItem", back_populates="author", cascade="all, delete-orphan") 