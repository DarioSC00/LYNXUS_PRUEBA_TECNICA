# C:\Users\ruben.salazar\OneDrive - Lynxus Solutions SAS\Desktop\PrimerRetoLynxus\PruebaTecnicaLynxus\BD\app\core\auth.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.crud.userController import user_crud
from typing import Optional

# 🔑 Define tu secreto y algoritmo para JWT (puedes guardarlos en .env)
SECRET_KEY = "mysecretkey12345"
ALGORITHM = "HS256"

# Ruta de login que devuelve token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def create_access_token(data: dict, expires_delta: Optional[int] = None):
    """
    Crea un token JWT para un usuario.
    data: diccionario con la info del usuario (ej. {"user_id": 1})
    expires_delta: segundos hasta que expire el token (opcional)
    """
    to_encode = data.copy()
    import datetime
    if expires_delta:
        expire = datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_delta)
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=60)  # 1 hora por defecto
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Return the currently authenticated user according to the JWT token.
    Raises an exception if the token is invalid or the user does not exist.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = user_crud.get_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user
