@echo off
echo [SYSTEM] Stopping any running containers...
docker compose down

echo [SYSTEM] Starting Recruitment Assistant System via Docker Compose...
echo This will start: Database, Redis, Backend, Frontend, and AI Service.
echo -------------------------------------------------------------------

:: Chạy docker compose và hiển thị log trực tiếp
docker compose up --build

pause