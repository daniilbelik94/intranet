import shutil
from pathlib import Path
from typing import Any, Dict, Optional, Union, List
import uuid # <-- Для генерации уникального суффикса

from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from slugify import slugify

from .base import CRUDBase
from app.models.news_item import NewsItem
from app.models.category import Category
from app.schemas.news_item import NewsItemCreate, NewsItemUpdate

# Define the upload directory for news images
UPLOAD_DIR = Path("backend/static/news_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    """Saves an uploaded file to the given destination and returns the file path relative to /static/."""
    try:
        # Generate a unique filename to prevent overwrites and ensure safety
        original_filename = Path(upload_file.filename).name
        file_extension = Path(original_filename).suffix
        unique_id = uuid.uuid4().hex[:8] # Short unique ID
        # Clean the original name part for the slug, then add unique id and extension
        base_name_slug = slugify(Path(original_filename).stem, max_length=50)
        safe_filename = f"{base_name_slug}_{unique_id}{file_extension}"
        
        file_path = destination / safe_filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()
    return f"/static/news_images/{safe_filename}" 

def delete_existing_image(cover_image_url: Optional[str]):
    """Deletes an image file if the path is provided and the file exists."""
    if cover_image_url:
        if cover_image_url.startswith("/static/"):
            # Construct the full system path from the /static/ relative path
            # Assumes that 'backend' is the parent of 'static'
            file_system_path = Path("backend") / Path(cover_image_url.lstrip('/'))
            if file_system_path.is_file():
                try:
                    file_system_path.unlink(missing_ok=True)
                except Exception as e:
                    print(f"Error deleting file {file_system_path}: {e}") # Log error


class CRUDNewsItem(CRUDBase[NewsItem, NewsItemCreate, NewsItemUpdate]):
    
    def generate_slug(self, text: str, max_length: int = 255) -> str:
        return slugify(text, max_length=max_length, word_boundary=True, separator="-")

    def get_by_slug(self, db: Session, *, slug: str) -> Optional[NewsItem]:
        return db.query(self.model).filter(self.model.slug == slug).first()

    def create_with_author_and_categories(
        self, 
        db: Session, 
        *, 
        obj_in: NewsItemCreate, 
        author_id: int, 
        cover_image: Optional[UploadFile] = None
    ) -> NewsItem:
        db_obj_data = obj_in.model_dump(exclude_unset=True)
        
        if cover_image:
            new_cover_image_url = save_upload_file(cover_image, UPLOAD_DIR)
            db_obj_data["cover_image_url"] = new_cover_image_url
        elif "cover_image_url" in db_obj_data and not db_obj_data["cover_image_url"] :
            db_obj_data["cover_image_url"] = None

        # Generate slug and ensure uniqueness
        base_slug_text = db_obj_data.get("slug") or db_obj_data["title"]
        current_slug = self.generate_slug(base_slug_text)
        
        counter = 1
        original_slug = current_slug
        while self.get_by_slug(db, slug=current_slug):
            current_slug = f"{original_slug}-{counter}"
            counter += 1
            if len(current_slug) > 255: # Ensure slug doesn't exceed max length for DB
                # Truncate and re-slugify if too long, this could be refined
                original_slug_truncated = self.generate_slug(original_slug, max_length=240) # a bit less to allow for counter
                current_slug = f"{original_slug_truncated}-{counter}"
                # Potentially re-check uniqueness if truncation changes slug significantly - for simplicity, we assume this is rare or accept potential collision for now
                # For a more robust solution, a truly random suffix might be better if truncation and counting often leads to collisions

        db_obj_data["slug"] = current_slug

        category_ids = db_obj_data.pop("category_ids", None)

        valid_model_keys = {key for key in db_obj_data if hasattr(NewsItem, key)}
        model_data = {key: db_obj_data[key] for key in valid_model_keys}

        db_obj = self.model(**model_data, author_id=author_id)
        db.add(db_obj)
        
        if category_ids:
            categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
            db_obj.categories = categories
        
        try:
            db.commit()
        except Exception as e: # Catch potential race condition if slug became non-unique between check and commit
            db.rollback()
            # Try to generate a more unique slug, perhaps with a random suffix, and retry or raise a clearer error
            # For simplicity now, we just re-raise
            # Consider adding logging here for such race conditions
            raise e

        db.refresh(db_obj)
        return db_obj

    def get_detailed(self, db: Session, id: int) -> Optional[NewsItem]:
        return (
            db.query(self.model)
            .options(joinedload(self.model.author), joinedload(self.model.categories))
            .filter(self.model.id == id)
            .first()
        )

    def update(
        self, 
        db: Session, 
        *, 
        db_obj: NewsItem, 
        obj_in: Union[NewsItemUpdate, Dict[str, Any]],
        cover_image: Optional[UploadFile] = None
    ) -> NewsItem:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        # Handle cover image update/removal
        if cover_image: # New image uploaded
            if db_obj.cover_image_url: 
                delete_existing_image(db_obj.cover_image_url)
            new_cover_image_url = save_upload_file(cover_image, UPLOAD_DIR)
            update_data["cover_image_url"] = new_cover_image_url
        # If cover_image_url is explicitly passed as None or an empty string, treat as deletion
        elif "cover_image_url" in update_data and (update_data["cover_image_url"] is None or update_data["cover_image_url"] == ""):
            if db_obj.cover_image_url:
                delete_existing_image(db_obj.cover_image_url)
            update_data["cover_image_url"] = None

        # Handle slug update (slugify if provided)
        if "slug" in update_data and update_data["slug"]:
            update_data["slug"] = self.generate_slug(update_data["slug"])
        elif "title" in update_data and ("slug" not in update_data or not update_data.get("slug")):
            # Если меняется title, а slug не предоставлен, можно опционально регенерировать slug
            # update_data["slug"] = self.generate_slug(update_data["title"])
            # Пока оставляем slug без изменений, если он не передан явно
            pass

        # Handle categories update
        if "category_ids" in update_data:
            category_ids = update_data.pop("category_ids") # Извлекаем, чтобы не попало в setattr
            if category_ids is None: # Если передано null, значит не меняем категории
                pass
            else: # Если передан список (пустой или нет)
                db_obj.categories.clear() # Очищаем старые связи
                if category_ids: # Если список не пустой, добавляем новые
                    categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
                    db_obj.categories = categories
        
        # Обновляем остальные поля объекта
        for field, value in update_data.items():
            if hasattr(db_obj, field): # Проверяем, что поле существует в модели
                setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_author_all_statuses(
        self, db: Session, *, author_id: int, skip: int = 0, limit: int = 100
    ) -> List[NewsItem]:
        return (
            db.query(self.model)
            .options(joinedload(self.model.author), joinedload(self.model.categories))
            .filter(NewsItem.author_id == author_id)
            .order_by(desc(self.model.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_count_by_author_all_statuses(self, db: Session, *, author_id: int) -> int:
        return (
            db.query(func.count(self.model.id))
            .filter(NewsItem.author_id == author_id)
            .scalar() or 0
        )

    def get_multi_public(
        self, db: Session, *, skip: int = 0, limit: int = 10
    ) -> List[NewsItem]:
        return (
            db.query(self.model)
            .options(joinedload(self.model.author), joinedload(self.model.categories))
            .filter(self.model.status == "published")
            .order_by(desc(self.model.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_count_public(self, db: Session) -> int:
        return db.query(func.count(self.model.id)).filter(self.model.status == "published").scalar() or 0

    def remove(self, db: Session, *, id: int) -> Optional[NewsItem]:
        db_obj = db.query(self.model).get(id) 

        if db_obj:
            if db_obj.cover_image_url: # Используем cover_image_url
                delete_existing_image(db_obj.cover_image_url)
            
            # Категории (связи в ассоциативной таблице) должны удалиться каскадно 
            # или их нужно очищать вручную перед удалением db_obj, если нет каскада
            # db_obj.categories.clear() # Если нужно перед удалением объекта новости
            
            db.delete(db_obj)
            db.commit()
        return db_obj

news_item = CRUDNewsItem(NewsItem) 