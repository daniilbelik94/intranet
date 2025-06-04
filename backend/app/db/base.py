# Этот файл будет импортировать Base и все модели, чтобы SQLAlchemy их "увидел"
from app.db.base_class import Base  # Импортируем Base
from app.models.user import User  # Импортируем модель User
from app.models.news_item import NewsItem # Импортируем модель NewsItem

# Здесь можно импортировать другие модели, когда они появятся
# from app.models.item import Item # Пример 

# Убедимся, что Base знает обо всех моделях. Это важно для Alembic или create_all.
__all__ = ["Base", "User", "NewsItem"] 