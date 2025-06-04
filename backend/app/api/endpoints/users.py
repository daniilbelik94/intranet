# Файл: app/api/endpoints/users.py

from typing import List, Any # Any можно заменить на конкретный тип модели SQLAlchemy, если импортировать models.User
from fastapi import APIRouter, Depends, HTTPException, Body # Добавил Body для явного указания
from sqlalchemy.orm import Session

from app import crud, models, schemas # Убедись, что импорты корректны
from app.api import deps # Зависимости, например, get_db, get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[schemas.User])
def read_users_directory(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user), # models.User - это твоя SQLAlchemy модель
) -> List[models.User]: # Указываем, что функция вернет список SQLAlchemy моделей
    """
    Получить список пользователей для справочника сотрудников.
    Доступно только аутентифицированным пользователям.
    """
    # Никаких print() для отладки в финальной версии, если они не нужны для логирования
    users_data = crud.user.get_multi(db, skip=skip, limit=limit)
    # FastAPI автоматически преобразует users_data (List[models.User])
    # в List[schemas.User] (определенный в response_model) для JSON ответа,
    # благодаря from_attributes = True в Pydantic схеме.
    return users_data

@router.put("/me", response_model=schemas.User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> models.User:
    """
    Update own user profile.
    Поля, которые можно обновлять: phone_number, photo_url.
    """
    allowed_update_data = {}
    if user_in.phone_number is not None:
        allowed_update_data["phone_number"] = user_in.phone_number
    if user_in.photo_url is not None:
        allowed_update_data["photo_url"] = user_in.photo_url

    if not allowed_update_data and not (user_in.phone_number == "" or user_in.photo_url == "") :
        # Разрешаем отправку пустых строк для очистки полей
        # Эта проверка немного усложнена, чтобы учесть очистку. 
        # Если оба поля null И не являются пустыми строками, то ошибка.
        if not (user_in.phone_number is None and user_in.photo_url is None):
             pass # Позволяем продолжить, если одно из полей было явно передано (даже как null для сброса)
        elif not (user_in.phone_number == "" or user_in.photo_url == ""): 
            raise HTTPException(
                status_code=400,
                detail="No valid fields provided for update. Allowed fields: phone_number, photo_url."
            )
    
    # Если поле было передано как None, но не было в allowed_update_data (например, не phone или photo), оно не будет обновлено
    # Если photo_url или phone_number переданы как пустая строка, они будут сохранены как пустая строка.
    # CRUDBase.update использует model_dump(exclude_unset=True) из Pydantic v2 (или exclude_none=True для v1), 
    # что означает, что если в user_in поле None и оно не было в allowed_update_data, оно не попадет в итоговый dict.
    # Поэтому allowed_update_data гарантирует, что только эти два поля могут быть модифицированы.

    updated_user = crud.user.update(db=db, db_obj=current_user, obj_in=allowed_update_data)
    return updated_user

# --- ВОССТАНАВЛИВАЕМ ОРИГИНАЛЬНЫЙ КОД ---
@router.put("/{user_id}", response_model=schemas.User)
def admin_update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_admin: models.User = Depends(deps.get_current_active_superuser)
) -> models.User:
    user_to_update = crud.user.get(db, id=user_id)
    if not user_to_update:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data: # Пароль не должен обновляться через этот эндпоинт
        del update_data["password"]
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update."
        )
    updated_user = crud.user.update(db=db, db_obj=user_to_update, obj_in=update_data)
    return updated_user

@router.get("/{user_id}", response_model=schemas.User)
async def read_user_by_id(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> models.User: # Указываем, что функция вернет одну SQLAlchemy модель
    """
    Получить конкретного пользователя по ID.
    """
    user = crud.user.get(db=db, id=user_id) # Синхронный вызов, await не нужен
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # FastAPI автоматически преобразует user (экземпляр models.User)
    # в schemas.User (определенный в response_model) для JSON ответа.
    return user

# Другие эндпоинты для управления пользователями могут быть здесь...

@router.get("/test_sync_list", response_model=List[str])
def test_sync_list_endpoint():
    print("--- DEBUG [users.py]: Entered /test_sync_list endpoint ---")
    my_list = ["apple", "banana", "cherry"]
    print(f"--- DEBUG [users.py]: Returning list from /test_sync_list: {my_list} ---")
    return my_list