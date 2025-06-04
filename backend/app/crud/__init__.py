# Этот файл нужен, чтобы Python считал директорию crud пакетом

from .crud_user import user # noqa
from .crud_news_item import news_item # noqa
from .crud_category import category # Добавлено

__all__ = ["user", "news_item", "category"] # Обновлено
