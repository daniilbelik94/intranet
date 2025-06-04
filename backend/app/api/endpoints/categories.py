from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    *, 
    db: Session = Depends(deps.get_db),
    category_in: schemas.CategoryCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Create new category. (Superuser only)
    """
    # Проверка, существует ли категория с таким именем или slug, если необходимо (частично делается в CRUD)
    # slug генерируется в CRUDCategory.create, если не предоставлен
    category = crud.category.create(db=db, obj_in=category_in)
    return category

@router.get("/", response_model=schemas.CategoryPublicList)
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user) # Доступно всем аутентифицированным
) -> Any:
    """
    Retrieve categories with pagination.
    """
    categories = crud.category.get_multi(db, skip=skip, limit=limit)
    total = crud.category.count(db)
    return schemas.CategoryPublicList(items=categories, total=total)

@router.get("/{category_id}", response_model=schemas.Category)
def read_category_by_id(
    *, 
    db: Session = Depends(deps.get_db),
    category_id: int,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get category by ID.
    """
    category = crud.category.get(db=db, id=category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

@router.get("/slug/{category_slug}", response_model=schemas.Category)
def read_category_by_slug(
    *, 
    db: Session = Depends(deps.get_db),
    category_slug: str,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get category by slug.
    """
    category = crud.category.get_by_slug(db=db, slug=category_slug)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found by slug")
    return category

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    *, 
    db: Session = Depends(deps.get_db),
    category_id: int,
    category_in: schemas.CategoryUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Update a category. (Superuser only)
    """
    category = crud.category.get(db=db, id=category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # Если в category_in есть name и нет slug, или если есть slug, его нужно перегенерировать/очистить.
    # Логика slugify в CRUDCategory.update отсутствует, но она есть в CRUDBase.update, 
    # если obj_in содержит slug, он будет использован. Если нужно принудительно slugify из name при обновлении,
    # то CRUDCategory.update нужно будет переопределить.
    # Пока что, если slug передается в category_in, он будет применен "как есть" (после model_dump)
    # Если slug не передается, он не изменится (если не менять имя) или останется старый (если имя меняется)
    # Для консистентности, лучше переопределить update в CRUDCategory, чтобы он тоже обрабатывал slug.
    # Сейчас просто вызовем базовый update.
    
    # Проверка уникальности name/slug при обновлении, если они меняются
    # if category_in.name:
    #     existing_name = crud.category.get_by_name(db, name=category_in.name)
    #     if existing_name and existing_name.id != category_id:
    #         raise HTTPException(status_code=400, detail="Category name already exists")
    # if category_in.slug:
    #     existing_slug = crud.category.get_by_slug(db, slug=category_in.slug) # Нужно будет slugify(category_in.slug) если применять очистку
    #     if existing_slug and existing_slug.id != category_id:
    #         raise HTTPException(status_code=400, detail="Category slug already exists")

    category = crud.category.update(db=db, db_obj=category, obj_in=category_in)
    return category

@router.delete("/{category_id}", response_model=schemas.Category)
def delete_category(
    *, 
    db: Session = Depends(deps.get_db),
    category_id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Delete a category. (Superuser only)
    """
    category = crud.category.get(db=db, id=category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    # TODO: Что делать с новостями, которые принадлежат этой категории? 
    # Варианты: отвязать, запретить удаление если есть новости, удалить новости (каскадно, если настроено).
    # Пока просто удаляем категорию. Связи в news_item_category_association удалятся автоматически SQLAlchemy (если PK).
    # Если есть ForeignKey(ondelete=...) в модели, оно сработает. 
    # В нашем случае ассоциативная таблица просто связывает, удаление категории не должно удалять новости.
    # Оно должно удалить записи из news_item_category_association.
    category = crud.category.remove(db=db, id=category_id)
    return category 