# 📊 Expense Management System

## 🚀 Overview
A full-stack Expense Management System built with **Streamlit (frontend)** and **FastAPI (backend)** with a **MySQL** database.  
It helps users track, manage, and visualize expenses efficiently.

---

## ✨ Features
- Add & update expenses with interactive forms  
- Monthly & category-wise analytics with metrics & charts  
- Dark mode theme with Altair data visualizations  
- Robust FastAPI REST backend with auto DB initialization  
- Ready for cloud deployment on **Streamlit Cloud**, **Render**, and **Docker**  

---

## 🛠️ Tech Stack
- **Frontend**: Streamlit, Streamlit Option Menu, Altair, Pandas
- **Backend**: FastAPI, Uvicorn, Pydantic
- **Database**: MySQL (Local, Docker, or Cloud TiDB/Aiven)

---

## 🌐 Deploy Online (Free)

Detailed step-by-step instructions for deploying to **Streamlit Community Cloud + Render + Free TiDB MySQL** or **Docker** are available in:

👉 **[Read the Full Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md)**

---

## ⚙️ Local Setup & Run

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Aayush2144/Expense_management.git
cd Expense_management

python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` and set your MySQL credentials:
```bash
cp .env.example .env
```

### 3. Run Backend & Frontend

**Option A — Run Both with a Single Command:**
```bash
python run_app.py
```

**Option B — Run Separately:**
- **Terminal 1 (Backend):**
  ```bash
  uvicorn backend.server:app --reload
  ```
- **Terminal 2 (Frontend):**
  ```bash
  streamlit run frontend/app.py
  ```

---

## 🐳 Run with Docker Compose
To run MySQL, FastAPI, and Streamlit all together with a single command:
```bash
docker compose up -d --build
```
- **Frontend**: http://localhost:8501
- **Backend Docs**: http://localhost:8000/docs
