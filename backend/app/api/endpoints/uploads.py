import shutil
import uuid
import os # Добавим os для удаления файла при необходимости
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.api import deps # Для зависимости get_current_active_user
from app import models # Если потребуется тип current_user

router = APIRouter()

# Определяем директорию для сохранения загруженных аватаров
# Убедитесь, что эта директория существует и доступна для записи
# Она должна быть внутри backend/static/, чтобы файлы были доступны через /static
UPLOAD_DIR_AVATARS = Path("backend/static/avatars")
UPLOAD_DIR_AVATARS.mkdir(parents=True, exist_ok=True) # Создаем директорию, если ее нет

MAX_AVATAR_SIZE_BYTES_BACKEND = 2 * 1024 * 1024 # 2MB (дублируем с фронтенда для независимости)

@router.post("/avatar", response_model=dict) # Простая модель ответа, можно уточнить
async def upload_avatar(
    *, 
    avatarfile: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user) # Защищаем эндпоинт
):
    """
    Загрузка файла аватара для текущего пользователя.
    Ожидает файл с ключом 'avatarfile'.
    Возвращает URL загруженного файла.
    """
    # Проверка типа файла (опционально, но рекомендуется)
    allowed_content_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if avatarfile.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Неподдерживаемый тип файла: {avatarfile.content_type}. Разрешены: {', '.join(allowed_content_types)}"
        )

    # Генерация уникального имени файла, чтобы избежать коллизий
    # Берем расширение из оригинального имени файла
    file_extension = Path(avatarfile.filename).suffix.lower()
    if not file_extension or file_extension not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        # Если расширения нет или оно странное, можно установить по умолчанию или по content_type
        # Для простоты, если расширение некорректно, можно выдать ошибку или использовать .png
        # Здесь мы будем более строги и потребуем корректное расширение из имени файла
        # или можно было бы пытаться его угадать из content_type
        if avatarfile.content_type == "image/jpeg": file_extension = ".jpg"
        elif avatarfile.content_type == "image/png": file_extension = ".png"
        elif avatarfile.content_type == "image/gif": file_extension = ".gif"
        elif avatarfile.content_type == "image/webp": file_extension = ".webp"
        else: 
             raise HTTPException(status_code=400, detail="Не удалось определить расширение файла или оно некорректно.")

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR_AVATARS / unique_filename

    try:
        # Сохраняем файл на диск
        # Используем shutil.copyfileobj для асинхронной работы с UploadFile
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(avatarfile.file, buffer)
        
        # Проверка размера файла ПОСЛЕ сохранения
        file_size = os.path.getsize(file_path) # или file_path.stat().st_size
        if file_size > MAX_AVATAR_SIZE_BYTES_BACKEND:
            os.remove(file_path) # Удаляем слишком большой файл
            raise HTTPException(
                status_code=413, # Request Entity Too Large
                detail=f"Файл слишком большой. Максимальный размер: {MAX_AVATAR_SIZE_BYTES_BACKEND / 1024 / 1024}MB."
            )

    except HTTPException: # Перехватываем HTTPException, чтобы не попасть в общий Exception ниже
        raise
    except Exception as e:
        print(f"Error processing avatar file: {e}") 
        # Если файл был создан, но произошла ошибка после этого (маловероятно здесь, но для полноты)
        if file_path.exists():
            try:
                os.remove(file_path)
            except Exception as e_remove:
                print(f"Could not remove partially saved/problematic file {file_path}: {e_remove}")
        raise HTTPException(status_code=500, detail="Не удалось обработать файл аватара.")
    finally:
        # Важно закрыть файл после использования
        await avatarfile.close()

    # Формируем относительный URL для доступа к файлу через StaticFiles
    # Этот URL будет использоваться на фронтенде для отображения и сохранения в профиле
    relative_photo_url = f"/static/avatars/{unique_filename}"
    
    return {"photo_url": relative_photo_url} 