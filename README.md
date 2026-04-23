# 🚀 Recruitment Assistant - Integrated System

Hệ thống hỗ trợ tuyển dụng thông minh sử dụng AI (Gemini) để phân tích CV và chấm điểm ứng viên.

## 🧩 Tech Stack

* **Frontend:** React + TypeScript + Vite
* **Backend:** Node.js + Express + Prisma + PostgreSQL
* **AI Service:** FastAPI (Python)

---

## 🛠 Prerequisites

Cài sẵn các tool sau trước khi chạy:

* Docker Desktop
* Node.js v20+
* Python 3.10+

---

## ⚙️ Setup nhanh

### 1. Clone & setup môi trường

```bash
cp backend/.env.example backend/.env
cp ai-python/.env.example ai-python/.env
```

### 2. Chạy Backend + Database (Docker)

```bash
docker compose --profile local-db up -d
```

Sau đó chạy:

```bash
# migrate DB
docker compose --profile local-db exec backend-local npx prisma migrate dev --name init

# seed data
docker compose --profile local-db exec backend-local npx prisma db seed
```

---

### 3. Chạy AI Service & Frontend

#### 🧠 AI Service

```bash
cd ai-python
pip install -r requirements.txt
python app.py
```

👉 URL: [http://localhost:8000](http://localhost:8000)

---

#### 💻 Frontend

```bash
cd frontend
npm install
npm run dev
```

👉 URL: [http://localhost:5173](http://localhost:5173)

---

## 🔍 Health Check

| Service       | URL                                                      | Expected  |
| ------------- | -------------------------------------------------------- | --------- |
| Frontend      | [http://localhost:5173](http://localhost:5173)           | Hiện jobs |
| Backend API   | [http://localhost:3000](http://localhost:3000)           | JSON OK   |
| AI Docs       | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger   |
| Prisma Studio | npx prisma studio                                        | Xem DB    |

