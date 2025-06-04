from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.db.base import Base
from app.core.config import settings
from app import crud, schemas

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.SQLALCHEMY_DATABASE_URL else {}
)

# Убираем глобальный вызов create_all
# Base.metadata.create_all(bind=engine) 
# print("--- DEBUG: Base.metadata.create_all(bind=engine) CALLED GLOBALLY ---")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db(db: Session) -> None:
    from app.models.user import User
    from app.models.news_item import NewsItem

    

    # Возвращаем логику суперпользователя
    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user:
        print(f"Creating first superuser: {settings.FIRST_SUPERUSER_EMAIL}")
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
            is_superuser=True,
            is_active=True,
            # Убедимся, что новые поля здесь тоже есть, если хотим их для суперюзера
            # position=None, # или какое-то значение по умолчанию
            # department=None,
            # photo_url=None,
            # phone_number=None
        )
        user = crud.user.create(db, obj_in=user_in)
        print("First superuser created.")
    else:
        print(f"Superuser {settings.FIRST_SUPERUSER_EMAIL} already exists. Skipping creation.")
    # print("--- DEBUG [session.py/init_db] Superuser logic is COMMENTED OUT ---") # Это можно убрать 