from fastapi import FastAPI, Request, status # Убираем TestAPIRouter, он был для теста
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path # Import Path

from app.db.session import init_db, SessionLocal # Импортируем SessionLocal
from app.api.endpoints import api_router # Импортируем агрегированный api_router
# from app.core.config import settings # Если понадобится для API_V1_STR

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Код, который выполнится перед тем, как приложение начнет принимать запросы
    print("Application startup...")
    # Создаем сессию БД специально для init_db
    db = SessionLocal()
    try:
        init_db(db) # Раскомментируем
        print("Database initialized.")
    finally:
        db.close() # Раскомментируем
    yield
    # Код, который выполнится после того, как приложение закончит принимать запросы
    print("Application shutdown...")

app = FastAPI(
    title="Intranet API",
    description="API for the modern intranet network.",
    version="0.1.0",
    lifespan=lifespan,
    #openapi_url=f"{settings.API_V1_STR}/openapi.json" # Если будет версионирование
)

# Create static directory if it doesn't exist
# This path should align with UPLOAD_DIR in crud_news_item.py and where files are served from
STATIC_FILES_DIR = Path("backend/static")
STATIC_FILES_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files directory
# This makes files under backend/static/ accessible via /static URL path
app.mount("/static", StaticFiles(directory=STATIC_FILES_DIR), name="static")

# Настройка CORS
# TODO: В продакшене стоит ограничить origins более строго
origins = [
    "http://localhost:5174", # Адрес вашего frontend приложения
    # Можно добавить другие адреса, если они есть (например, прод)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Разрешает все методы (GET, POST, OPTIONS и т.д.)
    allow_headers=["*"], # Разрешает все заголовки
)

# Обработчик для ошибок валидации Pydantic, чтобы логировать детали
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Pydantic validation error for: {request.method} {request.url}")
    try:
        body = await request.json()
        print(f"Request body received: {body}")
    except Exception as e:
        print(f"Could not parse request body in exception handler: {e}")
    print(f"Validation error details: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()} # Стандартный формат ответа FastAPI
    )

@app.get("/ping")
async def ping():
    """
    Health check endpoint.
    """
    return {"ping": "pong!"}

# Подключаем основной роутер API
# Все пути из api_router (auth, news, etc.) будут доступны через /api
app.include_router(api_router, prefix="/api")

# Пример для версионирования API, если потребуется позже:
# from app.core.config import settings
# app.include_router(api_router, prefix=settings.API_V1_STR)

# TODO: Include routers from app.api.v1 