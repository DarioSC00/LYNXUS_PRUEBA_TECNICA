# app/core/security.py

from typing import Dict
from datetime import datetime, timedelta
import logging
import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

log = logging.getLogger(__name__)

# 🔑 OAuth2 for FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# ------------------------
# PASSWORD FUNCTIONS (plain text - development only)
# ------------------------
def verify_password(plain_password: str, stored_password: str) -> bool:
    """Direct comparison without hashing (development only)."""
    return plain_password == stored_password


def get_password_hash(password: str) -> str:
    """Return password as-is (no hashing) - development only."""
    return password

# ------------------------
# JWT FUNCTIONS
# ------------------------
def create_access_token(data: Dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> Dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        log.warning("Token expired: %s...", (token or '')[:20])
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        log.warning("Invalid token received (first 60 chars): %s", (token or '')[:60])
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# ------------------------
# FUNCIONES DE USUARIO ACTIVO
# ------------------------
def get_current_active_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    try:
        log.debug("Authenticating token (preview): %s", (token or '')[:40])
        payload = decode_token(token)
    except HTTPException as e:
        log.warning("Authentication failed while decoding token: %s", e.detail)
        raise
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )

    return user

