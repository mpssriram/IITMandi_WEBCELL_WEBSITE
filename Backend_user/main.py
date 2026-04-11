from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

<<<<<<< Updated upstream:Backend/main.py
from .admin.routes import router as admin_router
from .auth import auth_dependencies
from .config import Config
from .user.routes import router as user_router
=======
try:
    from .admin.routes import router as admin_router
    from .auth import auth_dependencies
    from .config import Config
    from .Database import Database
    from .user.routes import router as user_router
except ImportError:
    from admin.routes import router as admin_router
    from auth import auth_dependencies
    from config import Config
    from Database import Database
    from user.routes import router as user_router
>>>>>>> Stashed changes:Backend_user/main.py


config = Config()
db = Database(config=config)

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


@app.on_event("startup")
def startup_event():
    db.ensure_core_schema()


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


app.include_router(admin_router)
app.include_router(user_router)


if __name__ == "__main__":
    uvicorn.run(
<<<<<<< Updated upstream:Backend/main.py
        "Backend.main:app",
=======
        "Backend_user.main:app",
>>>>>>> Stashed changes:Backend_user/main.py
        host=config.HOST,
        port=config.PORT,
        reload=False,
    )
