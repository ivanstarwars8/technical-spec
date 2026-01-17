# TutorAI CRM

Веб-приложение CRM для репетиторов с AI-генератором домашних заданий. Система управления учениками, расписанием, оплатами и автоматической генерацией учебных заданий через ChatGPT.

## Возможности

- **Управление учениками**: Полный CRUD для учеников с информацией о родителях и предметах
- **Календарь занятий**: Визуальное планирование расписания с отслеживанием статуса оплаты
- **Учёт платежей**: Отслеживание доходов, статистика, список должников
- **AI-генератор заданий**: Автоматическое создание уникальных задач через OpenAI API
- **Система подписок**: Тарифные планы с оплатой через ЮKassa
- **Telegram интеграция**: Готовые поля для подключения Telegram-бота

## Технический стек

### Backend
- **FastAPI** - современный веб-фреймворк
- **SQLAlchemy** - ORM для работы с базой данных
- **Alembic** - миграции базы данных
- **PostgreSQL** - основная база данных
- **OpenAI API** - генерация заданий
- **YooKassa** - платёжная система

### Frontend
- **React 18** - библиотека для UI
- **Vite** - сборщик и dev-сервер
- **Tailwind CSS** - utility-first CSS фреймворк
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **date-fns** - работа с датами
- **Lucide React** - иконки

## Быстрый старт

### Требования

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

### Установка

#### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd tutor-crm
```

#### 2. Настройка Backend

```bash
cd backend

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Создание .env файла
cp ../.env.example .env
# Отредактируйте .env и укажите параметры подключения к PostgreSQL
```

#### 3. Создание базы данных

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE tutor_crm;
\q
```

#### 4. Запуск миграций

```bash
# Из директории backend
alembic upgrade head
```

#### 5. Запуск Backend

```bash
# Из директории backend
uvicorn app.main:app --reload --port 8000
```

Backend будет доступен по адресу: http://localhost:8000
API документация (Swagger): http://localhost:8000/docs

#### 6. Настройка Frontend

```bash
cd ../frontend

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
```

#### 7. Запуск Frontend

```bash
# Из директории frontend
npm run dev
```

Frontend будет доступен по адресу: http://localhost:5173

## Структура проекта

```
tutor-crm/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy модели
│   │   ├── schemas/         # Pydantic схемы
│   │   ├── routers/         # API эндпоинты
│   │   ├── services/        # Бизнес-логика
│   │   ├── utils/           # Утилиты
│   │   ├── config.py        # Настройки
│   │   ├── database.py      # Подключение к БД
│   │   └── main.py          # Точка входа FastAPI
│   ├── alembic/             # Миграции БД
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/      # React компоненты
    │   ├── pages/           # Страницы приложения
    │   ├── services/        # API клиент
    │   ├── context/         # React Context
    │   ├── hooks/           # Custom hooks
    │   └── App.jsx
    └── package.json
```

## API Эндпоинты

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход (возвращает JWT)
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/refresh` - Обновление токена

### Ученики
- `GET /api/students/` - Список учеников
- `POST /api/students/` - Создать ученика
- `GET /api/students/{id}` - Получить ученика
- `PUT /api/students/{id}` - Обновить ученика
- `DELETE /api/students/{id}` - Удалить ученика
- `POST /api/students/{id}/generate-link-code` - Сгенерировать код для Telegram

### Занятия
- `GET /api/lessons/` - Список занятий с фильтрами
- `POST /api/lessons/` - Создать занятие
- `GET /api/lessons/{id}` - Получить занятие
- `PUT /api/lessons/{id}` - Обновить занятие
- `DELETE /api/lessons/{id}` - Удалить занятие
- `GET /api/lessons/calendar` - Данные для календаря

### Платежи
- `GET /api/payments/` - Список платежей
- `POST /api/payments/` - Добавить платёж
- `GET /api/payments/stats` - Статистика доходов
- `GET /api/payments/debtors` - Список должников

### Домашние задания
- `POST /api/homework/generate` - Сгенерировать задания через ChatGPT
- `GET /api/homework/` - История заданий
- `GET /api/homework/{id}` - Получить задание

### Подписка
- `GET /api/subscription/` - Текущий тариф
- `POST /api/subscription/upgrade` - Оплата через ЮKassa
- `POST /api/subscription/webhook` - Webhook ЮKassa

### Системные
- `GET /api/features` - Флаги доступности AI и оплаты

## Тарифные планы

- **Бесплатный**: 10 AI кредитов, до 5 учеников
- **Базовый** (990₽/мес): 100 AI кредитов, до 20 учеников
- **Премиум** (1990₽/мес): 1000 AI кредитов, неограниченно учеников

## Интеграция с Telegram

Приложение готово к интеграции с Telegram-ботом:

1. В карточке ученика есть кнопка "Привязать Telegram"
2. Генерируется уникальный 6-значный код
3. Ученик вводит код в боте
4. Бот записывает `telegram_id` в базу данных
5. Домашние задания можно отправлять через бота

## Конфигурация

### Backend (.env)

OpenAI и YooKassa опциональны для первого запуска: если ключи не заданы, соответствующие функции будут отключены.

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/tutor_crm
SECRET_KEY=your-secret-key
# OPENAI_API_KEY=
# YUKASSA_SHOP_ID=
# YUKASSA_SECRET_KEY=
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

## Разработка

### Создание новой миграции

```bash
cd backend
alembic revision --autogenerate -m "описание изменений"
alembic upgrade head
```

## Деплой

### Backend (на VPS с FastPanel)

1. Установите PostgreSQL
2. Создайте виртуальное окружение и установите зависимости
3. Настройте systemd service для uvicorn
4. Настройте nginx как reverse proxy
5. Запустите миграции

### Frontend

1. Соберите production версию: `npm run build`
2. Разверните содержимое `dist/` на веб-сервере
3. Настройте nginx для обслуживания статических файлов

## Лицензия

MIT License - см. файл LICENSE

## Автор

TutorAI CRM - система управления для репетиторов