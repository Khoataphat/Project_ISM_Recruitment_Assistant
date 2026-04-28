@echo off
title Recruitment Assistant - Full Stack Starter
echo [SYSTEM] Stopping and cleaning stale containers...
:: --remove-orphans giúp xóa các container rác nếu bạn có đổi tên service trong docker-compose
docker compose down --remove-orphans

echo [SYSTEM] Starting Recruitment Assistant System via Docker Compose...
echo Services: Database, Redis, Backend, Frontend, and AI Service.
echo -------------------------------------------------------------------

:: Dùng --build để đảm bảo nếu ai đó mới pull code và có thư viện mới, Docker sẽ build lại ngay
:: Bạn có thể bỏ qua --build ở các lần chạy sau nếu không có gì thay đổi để khởi động nhanh hơn
docker compose up --build

echo -------------------------------------------------------------------
echo System has stopped.
pause