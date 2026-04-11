from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
from .admin.routes import router as admin_router
from .auth import auth_dependencies
from .config import Config
from .Database import Database
from .user.routes import router as user_router
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


config = Config()
db = Database(config=config)

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
app = FastAPI(title=config.APP_NAME, debug=config.DEBUG)
=======
>>>>>>> Stashed changes
app = FastAPI(
    title=config.APP_NAME,
    debug=config.DEBUG,
)

<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    return {"status": "ok", "app": config.APP_NAME}
=======
>>>>>>> Stashed changes
    return {
        "status": "ok",
        "app": config.APP_NAME,
    }
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


@app.get("/me")
def get_me(current_user=Depends(auth_dependencies.get_current_user)):
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    return {"message": "Authenticated user fetched successfully.", "user": current_user}
=======
>>>>>>> Stashed changes
    return {
        "message": "Authenticated user fetched successfully.",
        "user": current_user,
    }
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes


app.include_router(admin_router)
app.include_router(user_router)


if __name__ == "__main__":
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    uvicorn.run("Backend_user.main:app", host=config.HOST, port=config.PORT, reload=False)
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
>>>>>>> 2f2962dab9d3219bb71e3a0d704e4ebffc7295f2
>>>>>>> Stashed changes
