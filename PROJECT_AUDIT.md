# SmartGate ANPR — Full Project Audit

**Date:** May 21, 2026  
**Scope:** All 46 files (vision, backend, frontend)

---

## Table of contents

1. [Project map](#1-project-map)
2. [Critical bugs](#2-critical-bugs)
3. [Why ANPR accuracy is poor](#3-why-anpr-accuracy-is-poor)
4. [How to improve image processing](#4-how-to-improve-image-processing)
5. [Sir's requirements alignment](#5-sirs-requirements-alignment)
6. [Frontend improvements](#6-frontend-improvements)
7. [Backend improvements](#7-backend-improvements)
8. [Quick wins this week](#8-quick-wins-this-week)
9. [File inventory](#9-file-inventory)

---

## 1. Project map

| Layer | Path | Role |
|--------|------|------|
| **Vision** | `vision/main.py` | Webcam → PaddleOCR on **entire frame** → POST plate to backend |
| **Backend** | `backend/src/` | Express + MySQL + Socket.IO |
| **Frontend** | `frontend/src/` | Next.js dashboard, fake login on `/` |

**Missing in repo:**

- Root `README.md`
- `vision/requirements.txt`
- `.env.example` (backend + frontend + vision)

---

## 2. Critical bugs

### 2.1 Live dashboard never updates (Socket event mismatch)

| Component | Event name |
|-----------|------------|
| Backend (`plateController.js`) | `newScan` |
| Frontend (`dashboard/page.tsx`) | `gate_event` |

**Fix:** Use the same event name on both sides (e.g. `newScan` everywhere).

```javascript
// backend/src/controllers/plateController.js
io.emit('newScan', resultData);

// frontend/src/app/dashboard/page.tsx — currently wrong:
socket.on("gate_event", handleGateEvent);
```

---

### 2.2 Audit logs & vehicles pages break without env

These pages call:

```text
process.env.NEXT_PUBLIC_BACKEND_URL + "/api/..."
```

If `NEXT_PUBLIC_BACKEND_URL` is unset → URL becomes `undefined/api/...` and fetch fails.

| File | Has localhost fallback? |
|------|-------------------------|
| `SocketProvider.tsx` | Yes |
| `dashboard/page.tsx` | Yes |
| `dashboard/logs/page.tsx` | **No** |
| `dashboard/vehicles/page.tsx` | **No** |

**Fix:** Use the same pattern everywhere:

```typescript
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
```

---

### 2.3 No real authentication

**Frontend**

- Login on `/` is fake: hardcoded `admin` / `password`
- Role stored in `localStorage` (`smartgate_role`)
- Anyone can open `/dashboard` via DevTools

**Backend**

- No JWT, sessions, or API keys
- Open endpoints:
  - `POST /api/plate` — inject fake scans
  - `POST /api/dashboard/vehicles` — add vehicles without auth
  - `GET /api/dashboard/logs` — read all logs

**Missing:** `users` table, Google OAuth, register API, route guards.

---

### 2.4 MySQL SSL may break local dev

`backend/src/db/connection.js` forces:

```javascript
ssl: { rejectUnauthorized: false }
```

Local MySQL (XAMPP/WAMP) often has **no SSL** → connection fails.

**Fix:** Make SSL optional via env, e.g. `DB_SSL=true`.

---

### 2.5 Double dashboard UI

- `dashboard/layout.tsx` — sidebar (Live Monitor, Audit Logs, Vehicles)
- `dashboard/page.tsx` — **also** renders its own `Navbar` and full-page layout

Result: `/dashboard` shows **sidebar + extra navbar**; other dashboard routes do not.

---

### 2.6 Other functional gaps

| Issue | Location |
|--------|----------|
| Export CSV button does nothing | `frontend/src/app/dashboard/logs/page.tsx` |
| `/api/dashboard/stats` unused | Backend has it; frontend calculates stats client-side only |
| `/login` only redirects to `/` | No dedicated register page |
| No plate validation on add vehicle | `dashboardController.addVehicle` |
| Duplicate log spam | Vision 4s cooldown; no DB dedup |
| No Python `requirements.txt` | Hard to reproduce vision setup |
| No API rate limiting | Backend fully open |

---

## 3. Why ANPR accuracy is poor

### Current pipeline (weak for gate use)

```text
Webcam full frame → PaddleOCR (whole image) → clean + correct chars → regex validate → POST
```

There is **no plate detection**, **no crop**, **no tracking**, **no vehicle-type handling**.

### Accuracy killers (in `vision/main.py`)

| # | Problem | Effect |
|---|---------|--------|
| 1 | OCR on **full frame** | Reads background text, stickers, UI — not just plate |
| 2 | No plate detector / ROI | Wrong strings, low confidence |
| 3 | Webcam only `VideoCapture(0)` | No RTSP/IP gate camera |
| 4 | 3-frame match + 4s cooldown | Moving vehicles often miss the window |
| 5 | Strict Indian regex only | Rejects old BH, 8-char, commercial, 2-wheeler layouts |
| 6 | `correct_plate_characters` | Can corrupt plates when length/format is wrong |
| 7 | `CONFIDENCE_THRESHOLD = 0.80` | Drops good reads; sometimes keeps bad ones after “fix” |
| 8 | `lang='en'` only | Weak on stylized / mixed plates |
| 9 | No preprocessing | Poor in night, glare, blur, dirt |
| 10 | `cv2.flip(frame, 1)` | Wrong for fixed gate camera (mirrors plate) |

### Validation regex (too narrow)

```python
pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$'
```

Rejects many real Indian plate variants.

---

## 4. How to improve image processing

### Target pipeline (recommended)

```text
Camera (RTSP/USB)
    → [optional] vehicle detect
    → plate detector (YOLO)
    → crop + perspective warp
    → preprocess (CLAHE, sharpen, denoise)
    → OCR (PaddleOCR / EasyOCR on crop only)
    → format rules + fuzzy DB match
    → tracker (same plate N frames)
    → backend (once per vehicle pass)
```

### Priority table

| Priority | Change | Why |
|----------|--------|-----|
| **P0** | Plate detector (YOLOv8/11 or Indian LP model) | OCR on plate ROI = biggest accuracy gain |
| **P0** | Crop + perspective correction | Angled plates, distance, font styles |
| **P0** | Tracker (ByteTrack / simple IoU) | Stable read while vehicle moves — **without stop** |
| **P1** | Preprocessing (CLAHE, adaptive threshold) | Night, glare, mud |
| **P1** | Fuzzy match to `vehicles` (Levenshtein 1–2) | One OCR char wrong still allows access |
| **P1** | RTSP URL in `.env` | Real gate camera |
| **P2** | Detect every N frames, OCR tracked ROI at 5–10 Hz | Speed + continuous reading |
| **P2** | Multiple plate format validators | All vehicle types |
| **P3** | Fine-tune OCR on campus plates | “All text styles” at your gate |
| **P3** | Smaller-plate model for two-wheelers | Different vehicle class |

### “Plate reading without stop”

- Run **detector + tracker** every frame (lightweight).
- Run **OCR** on tracked crop at ~5–10 Hz, not full-frame 30 FPS OCR.
- Confirm plate when:
  - same string seen **≥ N times** in **≤ T seconds**, or
  - weighted vote across frames.
- Cooldown per plate (e.g. 30–60s) to avoid log spam, not 4s only.
- Log `UNVERIFIED` for high-confidence reads that fail regex (manual review).
- Save snapshot image with low-confidence logs.

### Suggested libraries

- **Detection:** Ultralytics YOLO + Indian license plate datasets (e.g. Roboflow)
- **OCR:** PaddleOCR on crop, EasyOCR, or fine-tuned TrOCR
- **Tracking:** ByteTrack (often with YOLO)
- **Optional:** OpenALPR / cloud APIs (if allowed)

---

## 5. Sir's requirements alignment

| Requirement | Current state | Needed |
|-------------|---------------|--------|
| **Image processing (most important)** | Full-frame OCR only | Detect → crop → preprocess → OCR → track |
| **Plate reading without stop** | 3-frame buffer, 4s cooldown, webcam | Tracker + continuous ROI OCR + RTSP |
| **All vehicle types** | One regex | Multi-format rules + class-aware detection |
| **All text styles** | Generic English PaddleOCR | Preprocessing + plate-focused / fine-tuned OCR |
| **Google login + register** | Fake `localStorage` login | Auth.js + `users` table + protected API |
| **Not only frontend** | Backend has no auth | JWT / API keys, roles, secure CRUD |

---

## 6. Frontend improvements

### Current state

- Polished landing UI with **simulated** scans (not real camera).
- Dashboard components: `LiveAccessCard`, `LogTable`, `StatsRow`, theme toggle.
- Admin vehicles page works **if** env is set and user fakes Admin role.

### Add / fix

| Item | Action |
|------|--------|
| Google login | Auth.js (NextAuth v5) + Google Provider |
| Register page | `/register` — Google sign-up + optional email/password |
| Protect routes | `middleware.ts` — redirect if no session |
| Roles in DB | `ADMIN` \| `SECURITY`, not `localStorage` only |
| Socket event | Listen for `newScan` |
| Env fallback | All `fetch` calls use localhost fallback |
| Single layout | Remove duplicate `Navbar` on main dashboard page |
| Live camera | WebRTC or MJPEG from vision service on dashboard |
| Stats API | Use `GET /api/dashboard/stats` |
| Export CSV | Implement on logs page |
| Real login page | Separate `/login` instead of only `/` |

---

## 7. Backend improvements

| Area | Improvement |
|------|-------------|
| **Schema** | `users`, optional `sessions`, `plate_image` on `access_logs` |
| **Auth** | JWT for dashboard; API key for vision `POST /api/plate` |
| **Google** | Store `google_id`, `email`, `role` in `users` |
| **Dedup** | Skip insert if same `plate_number` within X seconds |
| **Validation** | Normalize plate on insert; reject invalid format |
| **Vehicles CRUD** | Update, deactivate, delete — not only add |
| **SSL** | `DB_SSL` env flag |
| **Socket** | Consistent `newScan`; optional rooms per gate |
| **Docs** | `.env.example` with all variables |

### Suggested env variables

**Backend (`backend/.env`)**

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartgate
DB_PORT=3306
DB_SSL=false
VISION_API_KEY=your-secret-key
```

**Frontend (`frontend/.env.local`)**

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
AUTH_SECRET=generate-with-openssl
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Vision (`vision/.env`)**

```env
BACKEND_URL=http://localhost:5000/api/plate
VISION_API_KEY=your-secret-key
CAMERA_SOURCE=0
# or RTSP: rtsp://user:pass@ip:554/stream
CONFIDENCE_THRESHOLD=0.75
FRAME_CHECK_COUNT=3
COOLDOWN_SECONDS=30
```

---

## 8. Quick wins this week

1. Fix **`newScan` vs `gate_event`** — live UI works.
2. Add **env fallback** on logs + vehicles pages.
3. Add **`requirements.txt`** + **`.env.example`**.
4. Add **plate detector + crop** in `vision/main.py` (pretrained YOLO weights).
5. Log high-confidence reads as `UNVERIFIED` when regex fails.
6. Make **MySQL SSL** optional.
7. Start **Google login** (Auth.js) + `users` table + protect API routes.

---

## 9. File inventory

### Vision

| File | Purpose |
|------|---------|
| `vision/main.py` | ANPR loop: webcam, PaddleOCR, backend POST |

### Backend

| File | Purpose |
|------|---------|
| `backend/src/index.js` | Express server, Socket.IO, routes |
| `backend/src/routes/plate.js` | `POST /api/plate` |
| `backend/src/routes/dashboard.js` | stats, logs, vehicles |
| `backend/src/controllers/plateController.js` | Scan handler, DB, socket emit |
| `backend/src/controllers/dashboardController.js` | Stats, logs, add vehicle |
| `backend/src/db/connection.js` | MySQL pool |
| `backend/src/db/seed.js` | Create tables + sample vehicle |
| `backend/src/socket/events.js` | Socket.IO init |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/app/page.tsx` | Landing + fake login |
| `frontend/src/app/login/page.tsx` | Redirect to `/` |
| `frontend/src/app/dashboard/page.tsx` | Live monitor (socket + logs) |
| `frontend/src/app/dashboard/layout.tsx` | Sidebar + role guard |
| `frontend/src/app/dashboard/logs/page.tsx` | Audit logs table |
| `frontend/src/app/dashboard/vehicles/page.tsx` | Admin vehicle registry |
| `frontend/src/app/developer/page.tsx` | Developer info page |
| `frontend/src/components/SocketProvider.tsx` | Socket.IO client |
| `frontend/src/components/LiveAccessCard.tsx` | Latest scan card |
| `frontend/src/components/LogTable.tsx` | Real-time log table |
| `frontend/src/components/StatsRow.tsx` | Today stats |
| `frontend/src/components/Navbar.tsx` | Top bar (main dashboard only) |

---

## Summary

SmartGate ANPR is a **working prototype** (vision → API → MySQL → dashboard) but:

- **Accuracy** suffers: no plate detector, full-frame OCR, strict regex.
- **Live UI** is broken: socket event name mismatch.
- **Auth** is cosmetic: no Google login, no backend security.
- **Sir's goals** need: detector + tracker + RTSP + multi-format plates + real auth.

Implement in order: **socket/env fixes → vision pipeline → Google auth + protected APIs**.

---

## Changelog (implemented)

- Fixed Socket.IO: frontend listens to `newScan`
- Vision: plate ROI detection, CLAHE preprocessing, relaxed validation, env config
- Backend: JWT auth, register, Google sync, API key for vision, fuzzy match, dedup
- Frontend: real login, `/register`, Google sign-in, protected dashboard API calls
- MySQL SSL optional via `DB_SSL`
- CSV export on audit logs
- See [README.md](./README.md) for setup

*Generated from full codebase review. Update this file as fixes are applied.*
