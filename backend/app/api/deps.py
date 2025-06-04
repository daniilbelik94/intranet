from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import logging # Добавим логирование
from typing import Generator, Optional
from pydantic import ValidationError

from app.core.config import settings
from app.core import security
from app import schemas, crud, models # models.User нам понадобится для типизации

# Здесь можно будет добавить другие зависимости, например, для получения текущего пользователя
# from app.models.user import User
# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from jose import jwt, JWTError
# from app.core.config import settings
# from app.core import security
# from app import schemas, crud
# from sqlalchemy.orm import Session

# tokenUrl должен указывать на эндпоинт, который выдает токен.
# В нашем случае это /auth/login, подключенный к app в main.py
# Если бы мы использовали префикс /api/v1 для всех эндпоинтов, было бы f"{settings.API_V1_STR}/auth/login"
# Но так как auth.router подключен с префиксом "/auth", то и tokenUrl будет "auth/login"

# Примечание: FastAPI автоматически обрабатывает префикс router-а, поэтому если
# FastAPI приложение имеет префикс /api, а роутер /auth/login, то итоговый URL
# может быть /api/auth/login. Но tokenUrl в OAuth2PasswordBearer обычно указывается
# относительно корня приложения, либо так, как он будет доступен клиенту.
# Для простоты, если префиксы не используются глобально в FastAPI(app), то просто путь.
# У нас `auth.router` подключен с префиксом `/auth`, так что `tokenUrl="auth/login"`.

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> models.User: # Возвращаем SQLAlchemy модель User
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            # Логируем перед выбросом исключения
            logging.error(f"Token decoding error: 'sub' field missing in token payload. Payload: {payload}")
            raise credentials_exception
        # Используем schemas.TokenPayload для валидации структуры payload, если хотим быть строже
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError, AttributeError) as e: # Добавил AttributeError
        # Логируем ошибку декодирования токена
        logging.error(f"Token decoding error: {e}") 
        raise credentials_exception
    
    user = crud.user.get_by_email(db, email=email) # Используем email из токена
    if user is None:
        # Логируем перед выбросом исключения
        logging.error(f"User not found for email: {email} from token.")
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    if not current_user.is_active:
        # Логируем перед выбросом исключения
        logging.warning(f"Attempt to access with inactive user: {current_user.email}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user 