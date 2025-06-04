from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import List, TYPE_CHECKING, Optional

from app.db.base_class import Base

if TYPE_CHECKING:
    from .news_item import NewsItem  # noqa: F401 - Импорт для type hinting

# Ассоциативная таблица для связи многие-ко-многим между NewsItem и Category
news_item_category_association = Table(
    'news_item_category_association', Base.metadata,
    Column('news_item_id', Integer, ForeignKey('news_items.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Связь многие-ко-многим с NewsItem
    news_items: Mapped[List["NewsItem"]] = relationship(
        "NewsItem",
        secondary=news_item_category_association,
        back_populates="categories"
    )

    def __repr__(self):
        return f"<Category(name='{self.name}')>" 