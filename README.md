# player-team-finder

Курсовая работа РКСП: платформа для поиска игроков и команд.

## Структура

- `backend/` — FastAPI API, SQLAlchemy, Alembic, PostgreSQL.
- `frontend/` — React + Vite клиент.

## Схема деплоя с одним внешним портом 5173

Если снаружи открыт только порт `5173`, backend не нужно открывать наружу. Он может работать внутри сервера на `127.0.0.1:8000`, а frontend на `0.0.0.0:5173` будет:

- отдавать React-приложение;
- проксировать `/api/*` во внутренний backend.

Внешний адрес приложения:

```text
http://176.108.254.224:5173/
```

Внешний адрес API через frontend-прокси:

```text
http://176.108.254.224:5173/api/v1
```

## Локальный запуск backend

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate.bat
pip install -r requirements.txt
cp backend/.env.example backend/.env
cd backend
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API будет доступен внутри машины на `http://127.0.0.1:8000`, Swagger — на `http://127.0.0.1:8000/docs`.

## Локальный запуск frontend в dev-режиме

```bash
cd frontend
npm install
npm run dev
```

Vite будет слушать `0.0.0.0:5173` и проксировать `/api` на `http://127.0.0.1:8000`.

## Production-запуск frontend на единственном внешнем порту

```bash
cd frontend
npm ci
npm run build
npm run serve
```

Переменные окружения frontend:

```env
VITE_API_URL=/api/v1
INTERNAL_API_URL=http://127.0.0.1:8000
FRONTEND_HOST=0.0.0.0
FRONTEND_PORT=5173
```

`frontend/server.mjs` отдаёт папку `dist` и проксирует `/api/*` на `INTERNAL_API_URL`.

## Production-запуск backend

```bash
cd backend
pip install -r ../requirements.txt
bash start.sh
```

Переменные окружения backend:

```env
SECRET_KEY=your-production-secret
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGINS=http://176.108.254.224:5173,http://localhost:5173,http://127.0.0.1:5173
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

`start.sh` сначала выполняет `alembic upgrade head`, затем запускает `uvicorn` на порту из переменной `$PORT`, по умолчанию `8000`.

## Проверка после запуска

Фронтенд:

```text
http://176.108.254.224:5173/
```

Health-check backend через frontend-прокси:

```text
http://176.108.254.224:5173/health
```

API через frontend-прокси:

```text
http://176.108.254.224:5173/api/v1/games/
```
