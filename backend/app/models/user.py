from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base # Импортируем Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False) # Новое поле для суперпользователя
    # is_superuser = Column(Boolean(), default=False) # Можно добавить позже

    # Новые поля для справочника сотрудников
    position = Column(String(255), nullable=True, index=True)
    department = Column(String(255), nullable=True, index=True)
    photo_url = Column(String(1024), nullable=True) # URL может быть длинным
    phone_number = Column(String(50), nullable=True)

    # Отношение к новостям
    # cascade="all, delete-orphan" означает, что если пользователь удален,
    # его новости также будут удалены.
    news_items = relationship(
        "NewsItem", 
        back_populates="author",
        cascade="all, delete-orphan"
    )

    # Если у вас будут связи, например, посты пользователя:
    # posts = relationship("Post", back_populates="owner") 

print(f"--- DEBUG [models/user.py]: User model defined. Columns: {User.__table__.columns.keys()} ---") 