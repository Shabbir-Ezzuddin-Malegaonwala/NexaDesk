# NexaDesk — Multi-Tenant AI-Powered Support Ticket System

A complete support ticket system built with three services:
- **Backend API** — Elysia + Drizzle ORM + PostgreSQL + BetterAuth
- **Frontend Dashboard** — Next.js 15 + Zustand + TailwindCSS
- **AI Service** — FastAPI + LangChain + Groq (llama-3.3-70b-versatile)

---

## Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or higher | https://nodejs.org |
| Python | v3.11 or higher | https://python.org |
| PostgreSQL | v14 or higher | https://postgresql.org |
| npm | v9 or higher | Comes with Node.js |
| pip | Latest | Comes with Python |

---

## Project Structure

```
nexadesk/
├── backend/          ← Elysia API (Port 3001)
├── frontend/         ← Next.js Dashboard (Port 3000)
├── ai-service/       ← FastAPI AI Service (Port 8000)
├── README.md
└── REPORT.md
```

---

## Step 1 — Set Up PostgreSQL Database

1. Open **pgAdmin** or **psql** and create a new database:

```sql
CREATE DATABASE nexadesk;
```

2. Note down your connection details:
   - Host: `localhost`
   - Port: `5432`
   - Database: `nexadesk`
   - Username: (your postgres username)
   - Password: (your postgres password)

---

## Step 2 — Set Up the Backend

### 2.1 Navigate to the backend folder

```bash
cd backend
```

### 2.2 Install dependencies

```bash
npm install
```

### 2.3 Create the environment file

Copy the example file and fill in your values:

```bash
copy .env.example .env
```

Open `.env` and update these values:
```
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/nexadesk
BETTER_AUTH_SECRET=any-long-random-string-here
```

### 2.4 Run database migrations

```bash
npm run db:push
```

This creates all the tables in your PostgreSQL database.

### 2.5 Start the backend server

```bash
npm run dev
```

Backend will run at **http://localhost:3001**

You should see:
```
🦊 Elysia is running at http://localhost:3001
```

---

## Step 3 — Set Up the AI Service

### 3.1 Open a NEW terminal and navigate to ai-service

```bash
cd ai-service
```

### 3.2 Create a virtual environment

```bash
python -m venv venv
```

### 3.3 Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3.4 Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3.5 Create the environment file

```bash
copy .env.example .env
```

Open `.env` and add your Groq API key:
```
GROQ_API_KEY=your-groq-api-key-here
```

> **Get a free Groq API key at:** https://console.groq.com

### 3.6 Start the AI service

```bash
uvicorn src.main:app --reload --port 8000
```

AI Service will run at **http://localhost:8000**

You should see:
```
Uvicorn running on http://127.0.0.1:8000
```

---

## Step 4 — Set Up the Frontend

### 4.1 Open a NEW terminal and navigate to frontend

```bash
cd frontend
```

### 4.2 Install dependencies

```bash
npm install
```

### 4.3 Create the environment file

```bash
copy .env.example .env.local
```

The default values should work without any changes.

### 4.4 Start the frontend

```bash
npm run dev
```

Frontend will run at **http://localhost:3000**

---

## Step 5 — Using the Application

1. Open your browser and go to **http://localhost:3000**
2. Click **Sign Up** to create a new account
3. Enter your name, email, password, and **organization name**
4. You will be automatically redirected to the dashboard
5. Click **+ New Ticket** to create your first support ticket
6. The AI will automatically classify the priority and category
7. Open the ticket and click **Suggest Response** to get an AI-generated reply

---

## All Three Services Must Be Running

| Service | URL | Terminal |
|---------|-----|----------|
| Backend API | http://localhost:3001 | Terminal 1 |
| AI Service | http://localhost:8000 | Terminal 2 |
| Frontend | http://localhost:3000 | Terminal 3 |

> **Important:** Start the Backend and AI Service BEFORE the Frontend.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for BetterAuth session signing |
| `BETTER_AUTH_URL` | URL of the backend (default: http://localhost:3001) |
| `FRONTEND_URL` | URL of the frontend for CORS (default: http://localhost:3000) |
| `AI_SERVICE_URL` | URL of the AI service (default: http://localhost:8000) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API |
| `NEXT_PUBLIC_AUTH_URL` | URL for BetterAuth client |

### AI Service (`ai-service/.env`)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | API key from https://console.groq.com |
| `MODEL_NAME` | LLM model to use (default: llama-3.3-70b-versatile) |

---

## How to Run Database Migrations

If you need to reset and re-run migrations:

```bash
cd backend
npm run db:push
```

To view your database tables in a browser UI:

```bash
cd backend
npm run db:studio
```

This opens Drizzle Studio at **http://localhost:4983**

---

## Assumptions and Limitations

- The AI Service requires an active internet connection to call the Groq API
- If the AI Service is offline, tickets can still be created — they will have `null` priority and category
- Multi-tenancy is enforced — each organization only sees its own tickets
- All three services must run simultaneously for full functionality
- The application is designed for desktop browsers; mobile layout is functional but not fully optimized
- Delete ticket is an admin-only operation accessible from the ticket detail page
