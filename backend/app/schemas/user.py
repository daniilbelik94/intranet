from pydantic import BaseModel, EmailStr
from typing import Optional

# --- Базовые поля пользователя ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    # Новые поля для справочника сотрудников
    position: Optional[str] = None
    department: Optional[str] = None
    photo_url: Optional[str] = None 
    phone_number: Optional[str] = None
    # В будущем можно добавить is_superuser: bool = False, role: str = "user", etc.

# --- Схема для создания пользователя (при регистрации) ---
# Ожидается от клиента, пароль будет хешироваться перед сохранением
class UserCreate(UserBase):
    password: str

# --- Схема для обновления пользователя ---
# Все поля опциональны
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None # Если пользователь хочет сменить пароль
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    # Новые поля для обновления
    position: Optional[str] = None
    department: Optional[str] = None
    photo_url: Optional[str] = None
    phone_number: Optional[str] = None

# --- Базовая схема для пользователя в БД (включая ID и хешированный пароль) ---
# Не должна напрямую возвращаться клиенту
class UserInDBBase(UserBase):
    id: int
    hashed_password: str

    class Config:
        from_attributes = True # Для SQLAlchemy моделей (orm_mode в Pydantic v1)

# --- Схема для отображения пользователя в API (без хешированного пароля) ---
class User(UserInDBBase):
    id: int
    # full_name уже есть в UserBase
    # is_active уже есть в UserBase

    class Config:
        from_attributes = True

# Можно добавить схему для хранения пользователя в БД, если она отличается от UserInDBBase
# class UserInDB(UserInDBBase):
#     pass 