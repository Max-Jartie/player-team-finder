# player-team-finder

Курсовая работа РКСП: платформа для поиска игроков и команд.

## Структура

- `backend/` — FastAPI API, SQLAlchemy, Alembic, PostgreSQL.
- `frontend/` — React + Vite клиент.

## Локальный запуск backend

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate.bat
pip install -r requirements.txt
cp backend/.env.example backend/.env
cd backend
alembic upgrade head
uvicorn app.main:app --reload
```

API будет доступен на `http://localhost:8000`, Swagger — на `http://localhost:8000/docs`.

## Локальный запуск frontend

```bash
cd frontend
npm install
npm run dev
```

По умолчанию Vite проксирует `/api` на `http://localhost:8000`, поэтому локально можно не задавать `VITE_API_URL`.

## Деплой backend

Для Render/Railway/аналогичной PaaS-платформы укажи:

- Root Directory: `backend`
- Build Command: `pip install -r ../requirements.txt`
- Start Command: `bash start.sh`

Переменные окружения backend:

```env
SECRET_KEY=your-production-secret
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGINS=https://your-frontend-domain.example
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

`start.sh` сначала выполняет `alembic upgrade head`, затем запускает `uvicorn` на порту из переменной `$PORT`.

## Деплой frontend

Для статического деплоя укажи:

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

Переменная окружения frontend:

```env
VITE_API_URL=https://your-backend-domain.example/api/v1
```

После изменения `VITE_API_URL` фронтенд нужно пересобрать, потому что переменные `VITE_*` подставляются на этапе сборки.
