# Recruitment Assistant

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Engine + Docker Compose)

> **Tip:** After installing Docker Desktop, make sure it's **running** before executing any command below.

---

## Quick Start (3 steps)

### 1. Clone the repo

```bash
git clone <repo-url>
cd Project_ISM_Recruitment_Assistant
```

### 2. Create the `.env` file

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in the real values (ask your team lead for credentials).

### 3. Start the backend

Running at the main folder: Project_ISM_Recruitment_Assistant>

```bash
docker compose up backend
```

The first run will take 1-2 minutes to build the image. After that you'll see:

```
Server running on PORT 3000
DB Connected via Prisma
```

The API is now available at **[http://localhost:3000](http://localhost:3000)**.

---

## Docker Commands Cheat Sheet


| Action                             | Command                                              |
| ---------------------------------- | ---------------------------------------------------- |
| Start (foreground, see logs)       | `docker compose up backend`                          |
| Start (background)                 | `docker compose up -d backend`                       |
| Stop                               | `docker compose down`                                |
| Rebuild after package.json changes | `docker compose up --build backend`                  |
| View logs                          | `docker compose logs -f backend`                     |
| Open a shell inside the container  | `docker compose exec backend sh`                     |
| Run Prisma migration               | `docker compose exec backend npx prisma migrate dev` |
| Run Prisma generate                | `docker compose exec backend npx prisma generate`    |


---

## Using a Local PostgreSQL (Optional)

If you don't want to use the remote Supabase database, you can spin up a local PostgreSQL alongside the backend:

```bash
docker compose --profile local-db up
```

This starts:

- **PostgreSQL 17** on port `5432` (user: `postgres`, password: `postgres`, database: `recruitment`)
- **Backend** on port `3000`, automatically connected to the local database

To run migrations on the local database:

```bash
docker compose --profile local-db exec backend-local npx prisma migrate dev
```

---

## How It Works (for the curious)

```
docker-compose.yml          (orchestrates services)
├── backend/
│   ├── Dockerfile          (defines the container image)
│   ├── .dockerignore       (excludes node_modules, .env, etc.)
│   ├── .env                (your local secrets — NOT committed)
│   └── .env.example        (template — committed to git)
```

**Why Docker solves the package problem:**


| Problem without Docker                  | How Docker fixes it                                               |
| --------------------------------------- | ----------------------------------------------------------------- |
| `bcrypt` fails to compile on Windows    | Container uses Linux — `bcrypt` compiles natively inside          |
| Different Node.js versions cause errors | Dockerfile pins `node:22-alpine` — everyone uses the same version |
| Prisma binary mismatch across OS        | Prisma generates the correct binary inside the Linux container    |
| "Works on my machine" syndrome          | Same container = same environment everywhere                      |


**Volume mount** (`./backend:/app`) syncs your local code into the container in real time, so you edit files normally in your IDE and `ts-node-dev` auto-reloads inside the container.

The `node_modules` **anonymous volume** (`/app/node_modules`) ensures packages installed inside the container are NOT overwritten by your local folder.

---

## Troubleshooting

### Port 3000 already in use

```bash
# Change the port in .env
PORT=3001
# Then restart
docker compose up backend
```

### Container won't start

```bash
# Check logs
docker compose logs backend

# Rebuild from scratch
docker compose down
docker compose up --build backend
```

### Need to reset local database

```bash
docker compose --profile local-db down -v   # -v removes the volume (data)
docker compose --profile local-db up
```

