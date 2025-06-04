from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.NewsItem)
def create_news_item(
    *, 
    db: Session = Depends(deps.get_db),
    title: str = Form(...),
    content: str = Form(...),
    slug: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    category_ids: Optional[List[int]] = Form(None),
    cover_image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Create new news item.
    Fields are taken from form-data.
    `category_ids` can be sent multiple times (e.g., category_ids=1&category_ids=2).
    Only superusers can create news items.
    """
    news_item_in_data = {
        "title": title,
        "content": content,
        "slug": slug,
        "short_description": short_description,
        "status": status,
        "category_ids": category_ids if category_ids else []
    }
    news_item_in = schemas.NewsItemCreate(**news_item_in_data)
    
    return crud.news_item.create_with_author_and_categories(
        db=db, obj_in=news_item_in, author_id=current_user.id, cover_image=cover_image
    )

@router.get("/", response_model=schemas.NewsItemPublicList)
def read_news_items_public(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10,
) -> Any:
    """
    Retrieve public news items with pagination.
    """
    news_items = crud.news_item.get_multi_public(db, skip=skip, limit=limit)
    total_count = crud.news_item.get_count_public(db)
    return schemas.NewsItemPublicList(items=news_items, total=total_count)

@router.get("/my", response_model=schemas.NewsItemPublicList)
def read_my_news_items(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve news items created by the current user (all statuses) with pagination.
    """
    news_items = crud.news_item.get_multi_by_author_all_statuses(
        db, author_id=current_user.id, skip=skip, limit=limit
    )
    total_count = crud.news_item.get_count_by_author_all_statuses(db, author_id=current_user.id)
    return schemas.NewsItemPublicList(items=news_items, total=total_count)

@router.get("/{item_id}", response_model=schemas.NewsItem)
def read_news_item(
    *, 
    db: Session = Depends(deps.get_db),
    item_id: int,
) -> Any:
    """
    Get news item by ID.
    """
    news_item = crud.news_item.get_detailed(db=db, id=item_id) 
    if not news_item:
        raise HTTPException(status_code=404, detail="News item not found")
    if news_item.status == "draft":
        pass 
    return news_item

@router.put("/{item_id}", response_model=schemas.NewsItem)
def update_news_item(
    *, 
    db: Session = Depends(deps.get_db),
    item_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    category_ids: Optional[List[int]] = Form(None),
    cover_image: Optional[UploadFile] = File(None),
    remove_cover_image: Optional[bool] = Form(False),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Update a news item.
    Allows partial updates. `category_ids` can be sent multiple times or as an empty list to clear.
    """
    news_item = crud.news_item.get(db=db, id=item_id)
    if not news_item:
        raise HTTPException(status_code=404, detail="News item not found")
    if news_item.author_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = {}
    if title is not None: update_data["title"] = title
    if content is not None: update_data["content"] = content
    if slug is not None: update_data["slug"] = slug
    if short_description is not None: update_data["short_description"] = short_description
    if status is not None: update_data["status"] = status
    
    if category_ids is not None:
        update_data["category_ids"] = category_ids 

    if remove_cover_image:
        update_data["cover_image_url"] = None
    
    news_item_update_schema = schemas.NewsItemUpdate(**update_data)
    
    return crud.news_item.update(
        db=db, db_obj=news_item, obj_in=news_item_update_schema, cover_image=cover_image
    )

@router.delete("/{item_id}", response_model=schemas.NewsItem)
def delete_news_item(
    *, 
    db: Session = Depends(deps.get_db),
    item_id: int,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Delete a news item.
    """
    news_item_to_delete = crud.news_item.get(db=db, id=item_id)
    if not news_item_to_delete:
        raise HTTPException(status_code=404, detail="News item not found")
    if news_item_to_delete.author_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    deleted_news_item = crud.news_item.remove(db=db, id=item_id)
    return deleted_news_item 