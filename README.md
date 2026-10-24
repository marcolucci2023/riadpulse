# RiadPulse

Audit digital complet pour riads et hôtels indépendants au Maroc.

## Stack
- **Frontend** : Next.js 15 + Tailwind CSS → Vercel
- **Backend** : FastAPI + Python 3.14 → Cloudflare Tunnel
- **DB** : Neon PostgreSQL
- **IA** : Gemini 2.5 Flash

## Démarrage

### Backend
\```bash
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
\```

### Frontend
\```bash
cd frontend
npm run dev
\```