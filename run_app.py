import os
import sys
import subprocess

def main():
    port = int(os.environ.get("PORT", 8000))

    # If explicitly requested to run Streamlit (legacy fallback)
    if "--streamlit" in sys.argv or os.environ.get("RUN_STREAMLIT", "false").lower() in ("true", "1"):
        print(f"--> Starting legacy Streamlit frontend on port {port}...")
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "frontend/app.py",
            "--server.port", str(port),
            "--server.address", "0.0.0.0"
        ])
        return

    # Standard production FastAPI entrypoint for Render and local development
    import uvicorn
    print(f"--> Starting FastAPI Backend on 0.0.0.0:{port}...")
    uvicorn.run("backend.server:app", host="0.0.0.0", port=port, reload=False)

if __name__ == "__main__":
    main()
