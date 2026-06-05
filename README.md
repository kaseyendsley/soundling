# Next.js + Django Fullstack Monorepo Template

A full-stack monorepo template combining a **Next.js + TypeScript** frontend with a **Django + Django REST Framework** backend.

Use this template as the starting point for new full-stack projects.

---

## Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, TanStack Query |
| Backend  | Django 5, Django REST Framework, Poetry         |

---

## Project Structure

```
nextjs-django-monorepo-template/
├── frontend/    # Next.js + TypeScript app
└── backend/     # Django + DRF API
```

---

## Getting Started

### Backend

```bash
cd backend
poetry install
source $(poetry env info --path)/bin/activate
python manage.py migrate
python manage.py runserver
```

API available at: http://127.0.0.1:8000
Health check: http://127.0.0.1:8000/health/

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:3000
Health page: http://localhost:3000/health

---

## Requirements

- Python 3.13+
- [Poetry](https://python-poetry.org/docs/#installation)
- Node.js 18+
- npm

---

## Using This Template

### Option A — GitHub "Use this template" button (recommended)

Click **Use this template** on the GitHub repo page, name your new project, and clone it.

### Option B — via `gh` CLI

```bash
gh repo create my-new-project --template kaseyendsley/nextjs-django-monorepo-template --private --clone
cd my-new-project
```

### Option C — manual clone

```bash
git clone https://github.com/kaseyendsley/nextjs-django-monorepo-template.git my-new-project
cd my-new-project
rm -rf .git
git init
git add .
git commit -m "initial commit"
gh repo create my-new-project --source=. --private --push
```

---

## License

This template is free to use and modify for any personal or professional projects.
