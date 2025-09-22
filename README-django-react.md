## InfinityHub Django + React Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1) Backend (Django REST API)

1. Create and activate a virtualenv (PowerShell):
   - `python -m venv .venv`
   - `.venv\\Scripts\\Activate.ps1`

2. Install dependencies:
   - `pip install -r backend/requirements.txt`

3. Run database migrations:
   - `python backend/manage.py migrate`

4. Start the API server (default http://127.0.0.1:8000):
   - `python backend/manage.py runserver 0.0.0.0:8000`

API base path: `/api/`
- Health: `GET /api/health/`
- Auth: `GET /api/login`, `POST /api/logout`, `GET|PATCH /api/auth/user`
- Posts: `GET|POST /api/posts`
- Gigs: `GET|POST /api/gigs`, `POST /api/gigs/:id/order`
- Products: `GET|POST /api/products`
- Blogs: `GET|POST /api/blogs`, `POST /api/blogs/generate`
- Chat: `GET /api/conversations`, `GET /api/conversations/:userId`, `POST /api/messages`
- Events: `GET|POST /api/events`
- AI: `GET /api/ai/chats`, `POST /api/ai/chat`, `POST /api/ai/content-ideas`
- Dashboard: `GET /api/dashboard/stats`

PayPal endpoints (required by client):
- `GET /setup`
- `POST /order`
- `POST /order/:orderId/capture`

Note: Endpoints currently return placeholder data. Replace with real logic/models.

### 2) Frontend (React)

From repo root:
- Install deps: `npm install`
- Start dev: `npm run dev`

The client uses relative URLs like `/api/...` and PayPal root routes. When developing, run Django on 8000 and the client on its dev server; configure a proxy if needed.

### 3) Environment Variables (optional)
Create `backend/.env` for overrides:
```
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=*
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=backend/db.sqlite3
```

### 4) Next steps
- Replace placeholder responses in `backend/api/views.py` with real implementations.
- Add models/serializers and auth provider.
- Configure CORS origins if deploying separately.
