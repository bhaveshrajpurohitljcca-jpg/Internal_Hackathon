# College Internal Hackathon Portal

A production-ready monorepo for managing college internal hackathon events. This repository contains a React frontend and a FastAPI backend.

## Features

- **Role-based Access Control**: Different views for Students, Admins, and Judges.
- **Real-time Registration & Submission**: Manage team formations and project submissions.
- **Secure Authentication**: JWT-based authentication system.
- **Responsive UI**: Modern interface built with Tailwind CSS.

## Project Structure

```
.
├── frontend/          # React 19 + Vite + TypeScript
├── backend/           # FastAPI + SQLAlchemy + PostgreSQL
├── README.md
└── .gitignore
```

## Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+
- **PostgreSQL** 14+

## Quick Start

### 1. Clone and configure environment

Copy the example environment files and update values as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

## Database Migrations

With the virtual environment activated and `DATABASE_URL` set in `backend/.env`:

```bash
cd backend
alembic upgrade head
```

Create a new migration after model changes:

```bash
alembic revision --autogenerate -m "description"
```

## Tech Stack

### Frontend

- React 19, Vite, TypeScript
- TailwindCSS, React Router DOM
- Axios, TanStack Query, React Hook Form, Zod
- React Hot Toast, Lucide React

### Backend

- FastAPI, Pydantic v2
- SQLAlchemy 2.0, Alembic, PostgreSQL
- JWT (python-jose), Passlib bcrypt
- python-dotenv

## Scripts

| Location   | Command           | Description              |
| ---------- | ----------------- | ------------------------ |
| `frontend` | `npm run dev`     | Start dev server         |
| `frontend` | `npm run build`   | Production build         |
| `frontend` | `npm run preview` | Preview production build |
| `backend`  | `uvicorn app.main:app --reload` | Start API server |

## License

Internal use — College Internal Hackathon Portal.
