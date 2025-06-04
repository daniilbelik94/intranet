from pydantic import BaseModel, EmailStr
from typing import Optional # Понадобится для опциональных полей, например, в TokenPayload

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None # "subject" токена, обычно это ID пользователя или email
    # Тут могут быть и другие поля, которые вы захотите включить в токен,
    # например, jti (JWT ID), exp (expiration time), iat (issued at), etc.
    # FastAPI Users обычно использует sub для user_id. 

class UserLogin(BaseModel): # Новая схема для запроса логина
    email: EmailStr
    password: str 