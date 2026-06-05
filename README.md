# Soundling

Soundling is a fullstack lead generation tool built as a monorepo with a **Next.js** frontend and a **Django** backend.

It is designed to help music licensing teams discover newly opened bars, restaurants, and event venues that feature live music, DJs, or karaoke, so they can contact those venues before competitors do.

---

## What Soundling Does

- Scans the internet for venues that opened recently (within ~90 days) and feature live music, DJs, or karaoke
- Pulls data from sources such as Google Maps/Places, Yelp, Eventbrite, local news sites, and public permit filings
- Stores discovered venues as leads in a central database
- Provides a dashboard for authenticated users to review and manage leads
- Supports automated schedule execution on a daily or weekly cadence

> Note: Instagram and Facebook are intentionally out of scope due to scraping restrictions and API limitations.

---

## Tech Stack

- Frontend: Next.js, TypeScript, TailwindCSS, TanStack Query
- Backend: Django, Django REST Framework, Poetry
- Database: PostgreSQL (production)

---

## Project Status

Early planning phase. Data sources, notification preferences, and final licensing workflows are still being confirmed with the client.

---

## Repository Structure

- `frontend/` — Next.js application and dashboard UI
- `backend/` — Django project, REST API, and lead management core

---

## Getting Started

### Backend

```bash
cd backend
poetry install
poetry shell
python manage.py migrate
python manage.py runserver
```

API available at: http://127.0.0.1:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:3000

---

## Requirements

- Python 3.13+
- Poetry
- Node.js 18+
- npm
- PostgreSQL for production deployments
