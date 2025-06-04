# Этот файл нужен, чтобы Python считал директорию endpoints пакетом 

from fastapi import APIRouter

from app.api.endpoints import auth, news, users, uploads, categories # Добавлено categories

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(news.router, prefix="/news", tags=["news"]) # Добавляем роутер для новостей
api_router.include_router(users.router, prefix="/users", tags=["users"]) # Добавляем роутер для пользователей
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"]) # Регистрируем новый роутер 
api_router.include_router(categories.router, prefix="/categories", tags=["categories"]) # Зарегистрирован роутер categories 