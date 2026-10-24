import os
import subprocess
import sys
import time
import signal

def main():
    port = os.environ.get("PORT", "8501")
    os.environ["API_URL"] = "http://127.0.0.1:8000"

    print("--> Starting FastAPI backend on http://127.0.0.1:8000...")
    backend_proc = subprocess.Popen([
        sys.executable, "-m", "uvicorn", "backend.server:app",
        "--host", "127.0.0.1", "--port", "8000"
    ])

    time.sleep(2)

    print(f"--> Starting Streamlit frontend on port {port}...")
    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "frontend/app.py",
            "--server.port", str(port),
            "--server.address", "0.0.0.0"
        ])
    except KeyboardInterrupt:
        pass
    finally:
        print("--> Shutting down backend...")
        backend_proc.terminate()
        try:
            backend_proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_proc.kill()

if __name__ == "__main__":
    main()
