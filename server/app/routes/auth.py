from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from sqlalchemy.orm import Session
from jose import jwt
import os

from app.config import SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
from app.database import SessionLocal
from app.models import User

router = APIRouter()

# OAuth setup
oauth = OAuth()
oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/login")
async def login(request: Request):
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)

@router.get("/auth/callback")
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=400, detail="Google login failed")

    user_email = user_info["email"]

    # SQLAlchemy ORM: check if user exists
    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        role = "admin" if user_email == os.getenv("ADMIN_EMAIL") else "user"
        user = User(email=user_email, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create JWT
    user_jwt = jwt.encode(
        {
            "email": user.email,
            "name": user_info.get("name"),
            "role": user.role,
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    redirect_url = f"http://localhost:3000?token={user_jwt}"
    return RedirectResponse(url=redirect_url)
