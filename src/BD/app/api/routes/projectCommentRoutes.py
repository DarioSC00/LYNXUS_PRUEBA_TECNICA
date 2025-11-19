from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from app.core.database import get_db
from app.models.comment import Comment
from app.models.user import User
from app.schemas.commentSchema import (
    CommentCreate,
    CommentOut,
    CommentRead
)
from app.api.dependencies import get_current_active_user
from typing import List

router = APIRouter()

@router.post("/{project_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def create_project_comment(
    project_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a comment in a project"""
    comment = Comment(
        body=comment_data.body,
        project_id=project_id,
        author_id=current_user.id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/{project_id}/comments", response_model=List[CommentOut])
def list_project_comments(
    project_id: int,
    db: Session = Depends(get_db)
):
    """List all comments for a project"""
    comments = db.query(Comment).options(
        selectinload(Comment.author)
    ).filter(Comment.project_id == project_id).all()
    return comments

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a project comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Solo el autor puede eliminar
    if comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this comment")
    
    db.delete(comment)
    db.commit()
    return None
