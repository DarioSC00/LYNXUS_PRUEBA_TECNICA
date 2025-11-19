# app/crud/commentController.py

from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional

from app.models.comment import Comment
from app.schemas.commentSchema import CommentCreate, CommentUpdate
from app.core.database import get_db
from fastapi import Depends

class CommentCRUD:

    def create(self, db: Session, *, obj_in: CommentCreate, author_id: int) -> Comment:
        """Create a new comment by the current user"""
        comment = Comment(
            body=obj_in.body,
            task_id=obj_in.task_id,
            project_id=obj_in.project_id,
            author_id=author_id
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return comment

    def get_by_task(self, db: Session, *, task_id: int, skip: int = 0, limit: int = 100) -> List[Comment]:
        """Get all comments for a task with optional pagination"""
        return db.query(Comment).filter(Comment.task_id == task_id).offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, *, comment_id: int) -> Optional[Comment]:
        """Get comment by ID"""
        return db.query(Comment).filter(Comment.id == comment_id).first()

    def update(self, db: Session, *, comment_id: int, obj_in: CommentUpdate, author_id: int) -> Optional[Comment]:
        """Update comment (only the author can update)"""
        comment = db.query(Comment).filter(
            and_(Comment.id == comment_id, Comment.author_id == author_id)
        ).first()
        
        if comment:
            update_data = obj_in.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(comment, field, value)
            
            db.commit()
            db.refresh(comment)
            return comment
        return None

    def delete(self, db: Session, *, comment_id: int, author_id: int) -> bool:
        """Delete comment (only the author can delete)"""
        comment = db.query(Comment).filter(
            and_(Comment.id == comment_id, Comment.author_id == author_id)
        ).first()
        
        if comment:
            db.delete(comment)
            db.commit()
            return True
        return False

    def count_by_task(self, db: Session, *, task_id: int) -> int:
        """Count total comments for a task"""
        return db.query(Comment).filter(Comment.task_id == task_id).count()


# Instancia global para usar en las rutas
comment_crud = CommentCRUD()
