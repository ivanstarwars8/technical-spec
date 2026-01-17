# Инструкции по запуску

## Проекты
- `backend/` — FastAPI API, модели, миграции Alembic, PostgreSQL
- `frontend/` — React UI (Vite)

## Минимальный запуск (без AI и оплаты)

### 1) Backend
1. Перейдите в `backend/` и создайте окружение:
   - `python -m venv venv`
   - `source venv/bin/activate`
2. Установите зависимости:
   - `pip install -r requirements.txt`
3. Создайте `.env` и укажите минимум:
   - `cp ../.env.example .env`
   - заполните `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`
   - оставьте `OPENAI_API_KEY`, `YUKASSA_SHOP_ID`, `YUKASSA_SECRET_KEY` пустыми
4. Подготовьте базу данных PostgreSQL и выполните миграции:
   - `alembic upgrade head`
5. Запустите API:
   - `uvicorn app.main:app --reload --port 8000`

API будет доступен на `http://localhost:8000`, Swagger на `http://localhost:8000/docs`.

### 2) Frontend
1. Перейдите в `frontend/`:
   - `cd ../frontend`
2. Установите зависимости:
   - `npm install`
3. Создайте `.env`:
   - `cp .env.example .env`
4. Запустите UI:
   - `npm run dev`

Frontend будет доступен на `http://localhost:5173`.

## Проверка интеграций
Состояние AI и оплаты можно проверить через `GET /api/features`.
