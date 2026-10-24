#!/usr/bin/env bash
set -e

# Default port to 8501 if PORT is not set by cloud provider
PORT="${PORT:-8501}"

echo "Starting FastAPI backend on port 8000..."
uvicorn backend.server:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

echo "Starting Streamlit frontend on port ${PORT}..."
export API_URL="http://127.0.0.1:8000"
streamlit run frontend/app.py --server.port "${PORT}" --server.address 0.0.0.0

# When streamlit exits, terminate backend
kill $BACKEND_PID
