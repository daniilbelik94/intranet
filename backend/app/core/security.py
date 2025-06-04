from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Контекст для хеширования паролей
# Используем bcrypt как схему по умолчанию
# "deprecated="auto" автоматически обновит хеши, если алгоритм изменится
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет обычный пароль на соответствие хешированному паролю."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Создает хеш из обычного пароля."""
    return pwd_context.hash(password)

# Функция для декодирования токена (может понадобиться для зависимостей)
# def decode_token(token: str) -> Optional[dict]:
#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except jwt.JWTError:
#         return None 