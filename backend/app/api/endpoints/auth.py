from fastapi import APIRouter, Depends, HTTPException, status
# Удаляем OAuth2PasswordRequestForm, так как он больше не нужен здесь
# from fastapi.security import OAuth2PasswordRequestForm 
from sqlalchemy.orm import Session
from datetime import timedelta

from app import crud, schemas, models # модели могут понадобиться для зависимостей позже
from app.api import deps # Зависимости, например get_db
from app.core.config import settings
from app.core import security

router = APIRouter()

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register_user(
    *, 
    db: Session = Depends(deps.get_db), 
    user_in: schemas.UserCreate
):
    """
    Register new user.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    user = crud.user.create(db, obj_in=user_in)
    return user

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    *,
    db: Session = Depends(deps.get_db),
    login_data: schemas.UserLogin 
):
    """
    Login for access token. Expects JSON body with email and password.
    """
    user = crud.user.authenticate(
        db, email=login_data.email, password=login_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}, 
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.email, 
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        # Можно также возвращать данные пользователя, если это нужно фронтенду сразу
        # "user": schemas.User.from_orm(user) # или user.model_validate(user) в pydantic v2
    }

@router.get("/me", response_model=schemas.User)
def read_users_me(
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Get current user.
    """
    # current_user уже является объектом models.User благодаря зависимости
    # FastAPI автоматически преобразует его в schemas.User при ответе
    return current_user

# Эндпоинт /me будет добавлен позже, когда мы реализуем зависимость для текущего пользователя 