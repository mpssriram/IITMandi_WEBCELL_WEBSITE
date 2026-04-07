from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from auth import auth_dependencies
from config import Config


config = Config()

app = FastAPI(
    title=config.APP_NAME,
    debug=config.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": config.APP_NAME,
    }


@app.get("/me")
def get_me(current_user=Depends(auth_dependencies.get_current_user)):
    return {
        "message": "Authenticated user fetched successfully.",
        "user": current_user,
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=False,
    )
