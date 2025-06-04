from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.NewsItem, status_code=status.HTTP_201_CREATED)
async def create_news_item(
    *,
    db: Session = Depends(deps.get_db),
    # title: str = Form(...), # Если хотим отдельные поля формы
    # content: str = Form(...),
    # Вместо этого, используем Depends для схемы, чтобы FastAPI мог парсить JSON из multipart
    news_in: schemas.NewsItemCreate = Depends(schemas.NewsItemCreate.as_form),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new news item.
    """
    # Проверка прав (например, только суперпользователь или авторизованный пользователь)
    # if not current_user.is_superuser:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN, 
    #         detail="Not enough permissions"
    #     )
    # Пока разрешим всем авторизованным пользователям создавать новости
    news = await crud.news_item.create_with_author(
        db=db, obj_in=news_in, author_id=current_user.id, image=image
    )
    # Для корректного отображения автора в ответе, Pydantic должен подтянуть его.
    # Если возникают проблемы, можно явно запросить новость с автором:
    # news_with_author = await crud.news_item.get_with_author(db, id=news.id)
    # if not news_with_author: # Маловероятно, но для полноты
    #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating news item")
    # return news_with_author
    return news


@router.get("/", response_model=schemas.NewsItemPublicList)
async def read_news_items(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 20,
) -> Any:
    """
    Retrieve news items with pagination.
    """
    news_items = crud.news_item.get_multi_public(db, skip=skip, limit=limit)
    total_count = crud.news_item.get_count_public(db)
    return {"items": news_items, "total": total_count}


@router.get("/{news_id}", response_model=schemas.NewsItem)
async def read_news_item(
    *,
    db: Session = Depends(deps.get_db),
    news_id: int,
) -> Any:
    """
    Get news item by ID.
    """
    news = await crud.news_item.get_with_author(db, id=news_id)
    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    return news


@router.put("/{news_id}", response_model=schemas.NewsItem)
async def update_news_item(
    *,
    db: Session = Depends(deps.get_db),
    news_id: int,
    news_in: schemas.NewsItemUpdate = Depends(schemas.NewsItemUpdate.as_form),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a news item.
    Only the author or a superuser can update.
    """
    news = crud.news_item.get(db=db, id=news_id) # Ensure no await, get is sync
    if not news:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    
    if not current_user.is_superuser and news.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions to update this news item"
        )
    
    updated_news = await crud.news_item.update(db=db, db_obj=news, obj_in=news_in, image=image)
    return updated_news


@router.delete("/{news_id}", response_model=schemas.NewsItem)
async def delete_news_item(
    *,
    db: Session = Depends(deps.get_db),
    news_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a news item.
    Only the author or a superuser can delete.
    """
    news_to_delete = crud.news_item.get(db=db, id=news_id) # Ensure no await, get is sync
    if not news_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")

    if not current_user.is_superuser and news_to_delete.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this news item",
        )

    deleted_news = crud.news_item.remove(db=db, id=news_id) # No longer awaits as remove is sync
    if not deleted_news: # Дополнительная проверка, хотя get() выше уже проверил
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found during deletion")
    return deleted_news 