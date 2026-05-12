# app/app.py

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import traceback
from typing import Dict, Any

# 🔹 Import routes
from app.routes.evaluation_routes import router as evaluation_router


# =========================================================
# 🔹 APP CONFIGURATION
# =========================================================

APP_NAME = "Teacher Evaluation Engine"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "AI-based Teacher Evaluation & Recruitment System"

DEBUG_MODE = True


# =========================================================
# 🔹 CREATE FASTAPI INSTANCE
# =========================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION
)


# =========================================================
# 🔹 MIDDLEWARE: CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# 🔹 MIDDLEWARE: REQUEST TIMER
# =========================================================

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()

    response: Response = await call_next(request)

    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 4))

    return response


# =========================================================
# 🔹 MIDDLEWARE: LOGGING
# =========================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[REQUEST] {request.method} {request.url}")

    response = await call_next(request)

    print(f"[RESPONSE] Status: {response.status_code}")

    return response


# =========================================================
# 🔹 GLOBAL ERROR HANDLER
# =========================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):

    error_trace = traceback.format_exc()

    print(f"[ERROR] {str(exc)}")
    print(error_trace)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
            "error": str(exc) if DEBUG_MODE else "Something went wrong"
        }
    )


# =========================================================
# 🔹 STARTUP EVENT
# =========================================================

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Evaluation Engine...")
    print(f"App Name: {APP_NAME}")
    print(f"Version: {APP_VERSION}")


# =========================================================
# 🔹 SHUTDOWN EVENT
# =========================================================

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Shutting down Evaluation Engine...")


# =========================================================
# 🔹 ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():
    return {
        "message": f"{APP_NAME} is running 🚀",
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# =========================================================
# 🔹 HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": APP_NAME
    }


# =========================================================
# 🔹 REGISTER ROUTES
# =========================================================

app.include_router(evaluation_router)


# =========================================================
# 🔹 OPTIONAL: SYSTEM INFO
# =========================================================

@app.get("/info")
def system_info():
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "features": [
            "Candidate Evaluation",
            "Batch Processing",
            "Rule Engine",
            "Decision Engine",
            "Insights Generator"
        ]
    }


# =========================================================
# 🔹 TEST ENDPOINT
# =========================================================

@app.get("/test")
def test_api():
    return {
        "success": True,
        "message": "API is working perfectly"
    }


# =========================================================
# 🔹 MOCK TEST DATA ENDPOINT
# =========================================================

@app.get("/sample")
def sample_data():
    return {
        "teacher_id": "T101",
        "name": "Sample Teacher",
        "communication": {"score": 8},
        "tech": {"score": 7},
        "experience_years": 2,
        "location": "same",
        "skills": ["python", "ml"],
        "required_skills": ["python", "ml", "dl"],
        "feedback": {"rating": 9},
        "achievements": 1
    }


# =========================================================
# 🔹 CUSTOM RESPONSE HELPER
# =========================================================

def create_response(
    success: bool,
    message: str,
    data: Any = None
) -> Dict[str, Any]:
    return {
        "success": success,
        "message": message,
        "data": data
    }


# =========================================================
# 🔹 DEBUG ROUTE
# =========================================================

@app.get("/debug")
def debug_info():
    return {
        "debug_mode": DEBUG_MODE,
        "routes_loaded": True
    }


# =========================================================
# 🔹 MANUAL RUN (OPTIONAL)
# =========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )