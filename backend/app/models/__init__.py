from .user import User  # Импортируем класс User из файла user.py
from .news_item import NewsItem  # noqa
from .category import Category, news_item_category_association

__all__ = ["User", "NewsItem", "Category", "news_item_category_association"]



