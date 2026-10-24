# 🌐 Online Deployment Guide for Expense Management System

This guide provides 3 easy ways to deploy the Expense Management System online for **free**.

---

## 🎯 Architecture Summary

- **Frontend**: Streamlit interactive dashboard (`frontend/app.py`)
- **Backend**: FastAPI REST API (`backend/server.py`)
- **Database**: Cloud MySQL database

---

## 🚀 Option 1: Cloud-Native Split Deployment (Recommended & 100% Free Forever)

This is the standard and most responsive deployment model:
1. **Free Cloud MySQL**: Hosted on TiDB Cloud Serverless or Aiven.
2. **Backend**: Hosted on Render (Free Web Service).
3. **Frontend**: Hosted on Streamlit Community Cloud (Free official hosting).

### Step 1: Set Up Free Cloud MySQL (TiDB Cloud)
1. Go to [TiDB Cloud](https://tidbcloud.com) and sign up with GitHub or Google (no credit card required).
2. Click **Create Cluster** and select **Serverless (Free)**.
3. Once created, click **Connect** on the cluster overview page.
4. Select connection method: **General** / **MySQL CLI**.
5. Note down your credentials:
   - **Host** (e.g., `gateway01.us-east-1.prod.aws.tidbcloud.com`)
   - **Port** (usually `4000`)
   - **User** (e.g., `xxxxxx.root`)
   - **Password**
   - **Database** (e.g., `test` or create `expense_manager`)

> 💡 **Note**: The backend automatically runs `init_db()` upon startup, creating the `expenses` table and inserting starter records automatically!

---

### Step 2: Deploy Backend to Render (Free)
1. Push your latest code changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure project for cloud deployment"
   git push origin main
   ```
2. Go to [render.com](https://render.com) and log in with GitHub.
3. Click **New +** -> **Web Service**.
4. Select your repository: `Expense_management`.
5. Configure the service settings:
   - **Name**: `expense-backend`
   - **Region**: Choose closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
6. Scroll down to **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `DB_HOST` | *(Your TiDB Cloud Host)* |
   | `DB_PORT` | `4000` |
   | `DB_USER` | *(Your TiDB Cloud User)* |
   | `DB_PASSWORD` | *(Your TiDB Cloud Password)* |
   | `DB_NAME` | `test` *(or your DB name)* |
7. Click **Deploy Web Service**.
8. Once deployed, copy your backend URL:  
   `https://expense-backend-xxxx.onrender.com`
9. Test by visiting `https://expense-backend-xxxx.onrender.com/docs` to view the live interactive Swagger documentation.

---

### Step 3: Deploy Frontend to Streamlit Community Cloud (Free)
1. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
2. Click **Create app** (or **New app**).
3. Fill in the details:
   - **Repository**: `Aayush2144/Expense_management`
   - **Branch**: `main`
   - **Main file path**: `frontend/app.py`
   - **App URL**: Choose a custom subdomain (e.g., `aayush-expense-tracker.streamlit.app`)
4. Click **Advanced settings** -> **Environment variables** (or **Secrets**) and add:
   ```env
   API_URL = "https://expense-backend-xxxx.onrender.com"
   ```
   *(Replace with your actual Render backend URL)*
5. Click **Deploy!**
6. Your expense management dashboard is now live on the internet! 🚀

---

## 📦 Option 2: Single All-in-One Web Service on Render / Railway

If you prefer to deploy everything under **one single URL** without managing two separate web services:

1. In Render, click **New +** -> **Web Service**.
2. Select your repository `Expense_management`.
3. Configure settings:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python run_app.py`
4. Set Environment Variables:
   - `DB_HOST`: *(Your cloud MySQL host)*
   - `DB_PORT`: `4000` (or `3306`)
   - `DB_USER`: *(Your cloud MySQL user)*
   - `DB_PASSWORD`: *(Your cloud MySQL password)*
   - `DB_NAME`: *(Your database name)*
5. Click **Deploy Web Service**.
   - `run_app.py` automatically runs FastAPI on `localhost:8000` and serves the Streamlit UI on Render's assigned `$PORT`.

---

## 🐳 Option 3: Deploy with Docker Compose (VPS / Self-Hosted / Local)

If deploying to a VPS (DigitalOcean, AWS EC2, Linode, Hetzner, etc.):

1. Clone repository on your server:
   ```bash
   git clone https://github.com/Aayush2144/Expense_management.git
   cd Expense_management
   ```
2. Launch the entire stack (MySQL + FastAPI + Streamlit):
   ```bash
   docker compose up -d --build
   ```
3. Open your browser:
   - Frontend: `http://<your-server-ip>:8501`
   - Backend Docs: `http://<your-server-ip>:8000/docs`
