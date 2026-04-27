taskkill /f /im node.exe >nul 2>&1

@echo off
echo [1/4] Starting Database and Redis via Docker...
docker compose up -d postgres redis

echo [2/4] Starting Backend Server...
start cmd /k "cd backend && npm run dev"

echo [3/4] Starting AI Service (FastAPI)...
start cmd /k "cd ai python && python app.py"

echo [4/4] Starting Frontend (Vite)...
start cmd /k "cd frontend && npm run dev"

echo All services are starting. Please wait a few seconds...
pause