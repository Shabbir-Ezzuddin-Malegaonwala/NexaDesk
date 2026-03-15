# NexaDesk — Complete Render Deployment Guide

This guide walks you through deploying all 3 NexaDesk services plus the PostgreSQL database on [Render](https://render.com), step by step.

## Architecture Overview

```mermaid
graph LR
    U[User Browser] --> F[Frontend<br/>Next.js on Render]
    F --> B[Backend<br/>Elysia/Node.js on Render]
    B --> AI[AI Service<br/>FastAPI/Python on Render]
    B --> DB[(PostgreSQL<br/>Render Database)]
```

Your 4 Render resources will be:

| Resource | Type | Tech |
|---|---|---|
| **nexadesk-db** | PostgreSQL Database | PostgreSQL 16 |
| **nexadesk-backend** | Web Service | Node.js (Elysia) |
| **nexadesk-ai** | Web Service | Python (FastAPI) |
| **nexadesk-frontend** | Web Service | Next.js |

---

## ⚠️ Code Changes Required Before Deploying

> [!CAUTION]
> Your codebase has **hardcoded `localhost` URLs** in several files. These **must** be changed to read from environment variables before deploying. I'll list each required change below.

---

### Change 1: Backend — CORS Origin ([index.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/index.ts))

**Current** (line 14):
```ts
origin: ["http://localhost:3000"],
```

**Change to:**
```ts
origin: [process.env.FRONTEND_URL ?? "http://localhost:3000"],
```

---

### Change 2: Backend — BetterAuth Trusted Origins ([auth.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/auth.ts))

**Current** (line 28):
```ts
trustedOrigins: ["http://localhost:3000"],
```

**Change to:**
```ts
trustedOrigins: [process.env.FRONTEND_URL ?? "http://localhost:3000"],
```

---

### Change 3: Backend — Listen Port ([index.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/index.ts))

**Current** (line 31):
```ts
.listen(3001);
```

**Change to:**
```ts
.listen(parseInt(process.env.PORT ?? "3001"));
```

Also update the console log on line 33:
```ts
console.log(`NexaDesk backend running on port ${process.env.PORT ?? 3001}`);
```

---

### Change 4: AI Service — CORS Origins ([main.py](file:///c:/Sudokon%20Training/nexadesk/ai-service/src/main.py))

**Current** (line 15):
```python
allow_origins=["http://localhost:3000", "http://localhost:3001"],
```

**Change to:**
```python
allow_origins=[
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    os.getenv("BACKEND_URL", "http://localhost:3001"),
],
```

Also add `import os` at the top of the file (after `from dotenv import load_dotenv`).

---

### Change 5: AI Service — Uvicorn Port

The AI service needs a startup command that reads the `PORT` env var. Create a new file:

#### [NEW] [start.py](file:///c:/Sudokon%20Training/nexadesk/ai-service/start.py)

```python
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port)
```

---

## Step-by-Step Render Deployment

### Step 1: Push Code to GitHub

Make sure your NexaDesk repo is pushed to GitHub with all the code changes above applied.

```bash
git add -A
git commit -m "prepare for Render deployment"
git push origin main
```

---

### Step 2: Create the PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name**: `nexadesk-db`
   - **Database**: `nexadesk`
   - **User**: `nexadesk_user` (or leave default)
   - **Region**: Choose one close to you (e.g., Oregon, Frankfurt)
   - **Plan**: **Free** (for testing) or **Starter** ($7/mo for production)
4. Click **Create Database**
5. Once created, go to the database page and copy the **Internal Database URL** (starts with `postgresql://...`). You'll need this for the backend.

> [!IMPORTANT]
> Use the **Internal Database URL** (not the External one) for service-to-service communication within Render — it's faster and free.

---

### Step 3: Deploy the AI Service (Python/FastAPI)

1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `nexadesk-ai` |
| **Region** | Same as database |
| **Root Directory** | `ai-service` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python start.py` |
| **Plan** | Free (or Starter) |

4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key (get one at [console.groq.com](https://console.groq.com)) |
| `MODEL_NAME` | `llama-3.3-70b-versatile` |
| `PORT` | `8000` |
| `PYTHON_VERSION` | `3.11.0` |
| `FRONTEND_URL` | *(leave blank for now, fill after frontend is deployed)* |
| `BACKEND_URL` | *(leave blank for now, fill after backend is deployed)* |

5. Click **Create Web Service**
6. Wait for it to deploy. Note the URL (e.g., `https://nexadesk-ai-xxxx.onrender.com`)

---

### Step 4: Deploy the Backend (Node.js/Elysia)

1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `nexadesk-backend` |
| **Region** | Same as database |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx drizzle-kit push` |
| **Start Command** | `npm start` |
| **Plan** | Free (or Starter) |

> [!TIP]
> The build command includes `npx drizzle-kit push` which will automatically create all your database tables (users, sessions, accounts, tickets, comments, organizations, etc.) during the first deploy.

4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `DATABASE_URL` | Paste the **Internal Database URL** from Step 2 |
| `BETTER_AUTH_SECRET` | Generate a secure random string at [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) |
| `BETTER_AUTH_URL` | `https://nexadesk-backend-xxxx.onrender.com` (your backend's Render URL) |
| `FRONTEND_URL` | *(leave blank for now, fill after frontend is deployed)* |
| `AI_SERVICE_URL` | `https://nexadesk-ai-xxxx.onrender.com` (the AI service URL from Step 3) |
| `PORT` | `3001` |
| `NODE_VERSION` | `20.11.0` |

> [!CAUTION]
> Do **NOT** use your local `BETTER_AUTH_SECRET` in production. Generate a new, strong secret.

5. Click **Create Web Service**
6. Note the URL (e.g., `https://nexadesk-backend-xxxx.onrender.com`)

---

### Step 5: Deploy the Frontend (Next.js)

1. Click **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `nexadesk-frontend` |
| **Region** | Same as others |
| **Root Directory** | `frontend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free (or Starter) |

4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://nexadesk-backend-xxxx.onrender.com` (backend URL from Step 4) |
| `NEXT_PUBLIC_APP_URL` | `https://nexadesk-frontend-xxxx.onrender.com` (this frontend's URL) |
| `NODE_VERSION` | `20.11.0` |

5. Click **Create Web Service**
6. Note the URL (e.g., `https://nexadesk-frontend-xxxx.onrender.com`)

---

### Step 6: Update Cross-Service URLs

Now that all services are deployed, go back and fill in the URLs you left blank:

#### Backend service → Environment Variables:
| Key | Value |
|---|---|
| `FRONTEND_URL` | `https://nexadesk-frontend-xxxx.onrender.com` |

#### AI Service → Environment Variables:
| Key | Value |
|---|---|
| `FRONTEND_URL` | `https://nexadesk-frontend-xxxx.onrender.com` |
| `BACKEND_URL` | `https://nexadesk-backend-xxxx.onrender.com` |

> [!NOTE]
> Each time you update environment variables on Render, the service will automatically redeploy.

---

## Complete Environment Variable Reference

### Backend (`backend/`)

| Variable | Required | Example Production Value | Used In |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host/nexadesk` | [db/index.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/db/index.ts), [drizzle.config.ts](file:///c:/Sudokon%20Training/nexadesk/backend/drizzle.config.ts) |
| `BETTER_AUTH_SECRET` | ✅ | `<random-32-char-string>` | [auth.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/auth.ts) (via BetterAuth) |
| `BETTER_AUTH_URL` | ✅ | `https://nexadesk-backend-xxxx.onrender.com` | [auth.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/auth.ts) (via BetterAuth) |
| `FRONTEND_URL` | ✅ | `https://nexadesk-frontend-xxxx.onrender.com` | [index.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/index.ts) (CORS), [auth.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/auth.ts) (trustedOrigins) |
| `AI_SERVICE_URL` | ✅ | `https://nexadesk-ai-xxxx.onrender.com` | [ai.service.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/services/ai.service.ts) |
| `PORT` | ⬚ | `3001` | [index.ts](file:///c:/Sudokon%20Training/nexadesk/backend/src/index.ts) |

### AI Service (`ai-service/`)

| Variable | Required | Example Production Value | Used In |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ | `gsk_...` | [llm.py](file:///c:/Sudokon%20Training/nexadesk/ai-service/src/llm.py) |
| `MODEL_NAME` | ⬚ | `llama-3.3-70b-versatile` | [llm.py](file:///c:/Sudokon%20Training/nexadesk/ai-service/src/llm.py) |
| `PORT` | ⬚ | `8000` | [start.py](file:///c:/Sudokon%20Training/nexadesk/ai-service/start.py) (new file) |
| `FRONTEND_URL` | ⬚ | `https://nexadesk-frontend-xxxx.onrender.com` | [main.py](file:///c:/Sudokon%20Training/nexadesk/ai-service/src/main.py) (CORS) |
| `BACKEND_URL` | ⬚ | `https://nexadesk-backend-xxxx.onrender.com` | [main.py](file:///c:/Sudokon%20Training/nexadesk/ai-service/src/main.py) (CORS) |
| `PYTHON_VERSION` | ⬚ | `3.11.0` | Render runtime config |

### Frontend (`frontend/`)

| Variable | Required | Example Production Value | Used In |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://nexadesk-backend-xxxx.onrender.com` | [api.ts](file:///c:/Sudokon%20Training/nexadesk/frontend/src/lib/api.ts), [auth-client.ts](file:///c:/Sudokon%20Training/nexadesk/frontend/src/lib/auth-client.ts) |
| `NEXT_PUBLIC_APP_URL` | ⬚ | `https://nexadesk-frontend-xxxx.onrender.com` | General reference |

---

## Post-Deployment Verification

After all services are deployed:

1. **Health Checks** — Visit these URLs in your browser:
   - `https://nexadesk-backend-xxxx.onrender.com/health` → Should return `{"status":"ok","service":"nexadesk-backend"}`
   - `https://nexadesk-ai-xxxx.onrender.com/health` → Should return `{"status":"ok","service":"nexadesk-ai"}`
   - `https://nexadesk-frontend-xxxx.onrender.com` → Should load the app

2. **Swagger Docs** — Visit `https://nexadesk-backend-xxxx.onrender.com/swagger` to test API endpoints

3. **End-to-End Test**:
   - Sign up for a new account on the frontend
   - Create an organization
   - Create a ticket
   - Trigger AI classification on the ticket
   - Test AI response suggestion

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `CORS error` in browser console | Verify `FRONTEND_URL` is set correctly on both backend and AI service. Ensure it matches exactly (no trailing slash). |
| `Database connection refused` | Make sure you're using the **Internal** Database URL, not External. |
| `AI service error: 500` | Check the AI service logs on Render. Likely `GROQ_API_KEY` is missing or invalid. |
| `better-auth` login issues | Verify `BETTER_AUTH_URL` matches the actual backend URL. Verify `BETTER_AUTH_SECRET` is set. |
| Service sleeps on free tier | Free tier services spin down after 15 min of inactivity. First request takes ~30s to wake up. Upgrade to Starter ($7/mo) for always-on. |
| `drizzle-kit push` fails during build | Check that `DATABASE_URL` is set correctly and the database is accessible. |

> [!TIP]
> On Render's free tier, services spin down after inactivity. For a smoother demo experience, consider upgrading at least the backend to the Starter plan, or use a service like [UptimeRobot](https://uptimerobot.com) to ping your health endpoints every 14 minutes.
