from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, Union, List

# Импортируем схему пользователя для встраивания информации об авторе
from .user import User as UserSchema # Используем UserSchema, чтобы избежать конфликта имен с моделью User
from .category import Category as CategorySchema # Импортируем схему Category
# Placeholder для схемы Category, будет импортирована позже
# from .category import Category as CategorySchema 

# Базовая схема для новости (общие поля для создания и чтения)
class NewsItemBase(BaseModel):
    title: str
    short_description: Optional[str] = None
    content: str # Предполагаем, что это HTML
    cover_image_url: Optional[Union[HttpUrl, str]] = None # Переименовано с image_url
    status: Optional[str] = None # e.g., "draft", "published". Модель поставит "draft" по умолчанию, если None

# Схема для создания новости (наследуется от базовой)
# При создании image_url может быть не указан или быть путем к файлу,
# который потом обработается и превратится в URL
class NewsItemCreate(NewsItemBase):
    category_ids: Optional[List[int]] = None # ID категорий для привязки

# Схема для обновления новости (все поля опциональны)
class NewsItemUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[Union[HttpUrl, str]] = None
    status: Optional[str] = None
    category_ids: Optional[List[int]] = None # ID категорий для обновления связей

# Схема для чтения новости (наследуется от базовой, добавляет ID и таймстемпы)
class NewsItemInDBBase(NewsItemBase):
    id: int
    slug: str # Добавлено поле slug
    author_id: int # Оставляем author_id для информации
    author: UserSchema # Включаем полную информацию об авторе
    
    categories: List[CategorySchema] = [] # Список связанных категорий
    
    created_at: datetime
    published_at: Optional[datetime] = None # Добавлено поле published_at
    updated_at: datetime

    class Config:
        from_attributes = True

# Основная схема для возврата новости пользователю
class NewsItem(NewsItemInDBBase):
    pass

# Схема для ответа со списком новостей и общим количеством
class NewsItemPublicList(BaseModel):
    items: List[NewsItem] # Используем List из typing
    total: int 