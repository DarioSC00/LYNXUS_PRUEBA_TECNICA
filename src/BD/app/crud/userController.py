from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.userSchema import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password

class UserCRUD:
    def get(self, db: Session, id: int) -> Optional[User]:
        return db.query(User).filter(User.id == id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, user: UserCreate) -> User:
        db_user = User(
            email=user.email,
            name=user.name,
            password_hash=get_password_hash(user.password),  # Sin hash real, solo guarda texto plano
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def update(self, db: Session, db_user: User, user_update: UserUpdate) -> User:
        if user_update.name is not None:
            db_user.name = user_update.name
        if user_update.email is not None:
            db_user.email = user_update.email
        if user_update.password is not None:
            db_user.password_hash = get_password_hash(user_update.password)  # Sin hash real
        db.commit()
        db.refresh(db_user)
        return db_user

    def delete(self, db: Session, id: int):
        db_user = self.get(db, id)
        if db_user:
            db.delete(db_user)
            db.commit()
        return db_user

user_crud = UserCRUD()