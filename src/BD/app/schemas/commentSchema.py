from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .userSchema import UserOut

class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1)
    task_id: Optional[int] = None
    project_id: Optional[int] = None

class CommentUpdate(BaseModel):
    body: Optional[str] = Field(None, min_length=1)

class CommentRead(BaseModel):
    id: int
    task_id: Optional[int] = None
    project_id: Optional[int] = None
    author_id: int
    body: str
    created_at: datetime

    class Config:
        from_attributes = True

class CommentsPage(BaseModel):
    items: List[CommentRead]
    total: int
    page: int
    page_size: int

class CommentOut(BaseModel):
    id: int
    body: str
    author: Optional[UserOut] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
