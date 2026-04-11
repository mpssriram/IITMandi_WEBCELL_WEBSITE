import logging

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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


config = Config()
db = Database(config=config)
logger = logging.getLogger(__name__)

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
    try:
        onboarding_required = bool(current_user.get("onboarding_required")) or not bool(current_user.get("roll_number"))
        logger.info(
            "/me resolved user",
            extra={
                "uid": current_user.get("uid"),
                "email": current_user.get("email"),
                "new_user": bool(current_user.get("new_user")),
                "onboarding_required": onboarding_required,
            },
        )

        return {
            "message": "Authenticated user fetched successfully.",
            "new_user": bool(current_user.get("new_user")),
            "onboarding_required": onboarding_required,
            "user": current_user,
        }
    except Exception:
        logger.exception("Unhandled error in /me route")
        return {
            "message": "Session resolved with limited profile information.",
            "new_user": True,
            "onboarding_required": True,
            "user": {
                "uid": current_user.get("uid") if isinstance(current_user, dict) else None,
                "email": current_user.get("email") if isinstance(current_user, dict) else None,
            },
        }


app.include_router(admin_router)
app.include_router(user_router)


if __name__ == "__main__":
    uvicorn.run(
        "Backend_user.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=False,
    )
