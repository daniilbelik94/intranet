from app.crud.base import CRUDBase
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from sqlalchemy.orm import Session
from typing import Optional, List
import re
from slugify import slugify # Будем использовать slugify для генерации slug

class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def get_by_slug(self, db: Session, *, slug: str) -> Optional[Category]:
        return db.query(Category).filter(Category.slug == slug).first()

    def get_by_name(self, db: Session, *, name: str) -> Optional[Category]:
        return db.query(Category).filter(Category.name == name).first()

    def create(self, db: Session, *, obj_in: CategoryCreate) -> Category:
        # Генерируем slug из name, если он не предоставлен или пуст
        db_obj_data = obj_in.model_dump()
        if not db_obj_data.get("slug"):
            db_obj_data["slug"] = self.generate_slug(db_obj_data["name"])
        else:
            # Если slug предоставлен, все равно прогоняем через slugify для консистентности
            db_obj_data["slug"] = self.generate_slug(db_obj_data["slug"])
        
        # Проверяем уникальность slug перед созданием
        existing_slug = self.get_by_slug(db, slug=db_obj_data["slug"])
        if existing_slug:
            # Можно добавить счетчик к slug или выбросить ошибку
            # Пока просто добавим суффикс, если такой slug уже есть
            # Более сложная логика может потребоваться для гарантированной уникальности
            # Например, db_obj_data["slug"] = f"{db_obj_data['slug']}-{uuid.uuid4().hex[:6]}"
            # Но для начала, если сгенерированный slug совпадает с существующим, 
            # а пользователь не передал свой slug, это может быть проблемой.
            # Если пользователь передал slug и он уже есть - это точно ошибка.
            # Сейчас, если slug (предоставленный или сгенерированный) уже есть - будет ошибка уникальности БД
            # или, если мы будем обрабатывать здесь, то можно модифицировать slug.
            # Оставим как есть, БД выкинет ошибку если что, или мы добавим обработку позже.
            pass # Пусть БД обработает конфликт уникальности slug, если он возникнет

        # Проверяем уникальность name перед созданием
        # existing_name = self.get_by_name(db, name=obj_in.name)
        # if existing_name:
        #     raise HTTPException(status_code=400, detail=f"Category with name '{obj_in.name}' already exists.")
        # Уникальность name также проверяется на уровне БД.

        return super().create(db, obj_in=CategoryCreate(**db_obj_data))

    def generate_slug(self, text: str) -> str:
        # Используем python-slugify для генерации "чистого" slug
        # max_length можно настроить, если нужно
        return slugify(text, max_length=100, word_boundary=True, separator="-")

category = CRUDCategory(Category) 