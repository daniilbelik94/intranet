from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func # Import func for count

from app.db.base_class import Base  # Убедитесь, что путь к Base корректен

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        Базовый CRUD объект с методами по умолчанию для Создания, Чтения, Обновления, Удаления (CRUD).

        **Параметры**
        * `model`: SQLAlchemy модель
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        Получает одну запись по ID.
        """
        # Примечание: db.query(...).filter(...).first() является синхронной операцией.
        # FastAPI запускает синхронные маршруты/зависимости в пуле потоков.
        return db.query(self.model).filter(self.model.id == id).first() # type: ignore

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """
        Получает несколько записей с пагинацией.
        """
        return db.query(self.model).offset(skip).limit(limit).all()

    def count(self, db: Session) -> int:
        """
        Подсчитывает общее количество записей в таблице.
        """
        return db.query(func.count(self.model.id)).scalar() # type: ignore

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Создает новую запись в БД.
        """
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Обновляет существующую запись в БД.
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            # exclude_unset=True чтобы обновлять только переданные поля
            update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        db.add(db_obj) # или db.merge(db_obj) в некоторых случаях
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[ModelType]:
        """
        Удаляет запись из БД по ID.
        Возвращает удаленный объект или None, если он не найден.
        """
        obj = self.get(db, id=id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj 