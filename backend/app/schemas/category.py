from pydantic import BaseModel
from typing import Optional, List

# Placeholder для схемы NewsItem, если понадобится для вложенных ответов
# from .news_item import NewsItem as NewsItemSchema

# Базовая схема для категории
class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None # Slug может генерироваться на сервере из name, если не предоставлен
    description: Optional[str] = None

# Схема для создания категории
class CategoryCreate(CategoryBase):
    pass # name обязательно, slug и description опциональны

# Схема для обновления категории (все поля опциональны)
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None

# Схема, представляющая категорию как она хранится в БД (включая ID)
class CategoryInDBBase(CategoryBase):
    id: int
    # news_items: List[NewsItemSchema] = [] # Пока не включаем, чтобы избежать циклических зависимостей

    class Config:
        from_attributes = True

# Основная схема для возврата категории пользователю
class Category(CategoryInDBBase):
    pass

# Если понадобится схема для списка категорий с доп. информацией
class CategoryPublicList(BaseModel):
    items: List[Category]
    total: int 