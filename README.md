# SmartGate ANPR

Automated Number Plate Recognition for campus gate access.

## Stack

- **Vision:** Python, OpenCV, PaddleOCR (`vision/main.py`)
- **Backend:** Node.js, Express, MySQL, Socket.IO
- **Frontend:** Next.js, Tailwind

## Quick start

### 1. Database

```bash
cd backend
cp .env.example .env
# Edit DB_* and JWT_SECRET
npm install
node src/db/seed.js
npm start
```

Default admin (after seed): `admin@smartgate.local` / `password`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL and optional GOOGLE_CLIENT_ID
npm install
npm run dev
```

### 3. Vision

```bash
cd vision
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
python main.py
```

## Google login setup

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create **OAuth 2.0 Client ID** (Web application)
3. Authorized JavaScript origins: `http://localhost:3000`
4. Copy Client ID to `frontend/.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Environment

See `backend/.env.example`, `frontend/.env.example`, `vision/.env.example`.

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | API auth tokens (required for dashboard) |
| `VISION_API_KEY` | Optional; vision must send `x-api-key` header if set |
| `DB_SSL` | `true` only for cloud MySQL with SSL |
| `CAMERA_SOURCE` | `0` or RTSP URL |

## What each scan shows

| Field | Source |
|-------|--------|
| Plate number | Camera OCR (vision) |
| Vehicle type, color, plate type | **Detected** by camera (vision) |
| Owner name, designation, dept, phone, make | **Database** when plate is registered |
| Unknown vehicle | Shows detected type/color; owner = Unknown |

Re-run seed after pull: `node src/db/seed.js` (adds new columns).

## What was improved

- Socket event fixed: `newScan` live updates
- Plate ROI detection + preprocessing in vision
- Fuzzy plate match, dedup, UNVERIFIED reads
- JWT auth + register + Google sign-in
- Protected dashboard APIs
- Full vehicle profile on live card, logs, registry, CSV

See [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) for full analysis.
