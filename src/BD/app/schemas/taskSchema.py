from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from .userSchema import UserOut
from .commentSchema import CommentOut

# Literal types for status and priority
StatusType = Literal["todo", "doing", "done"]
PriorityType = Literal["low", "medium", "high"]

# Model to create a task
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    status: Optional[StatusType] = "todo"
    priority: Optional[PriorityType] = "low"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

# Model to update a task
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    status: Optional[StatusType] = None
    priority: Optional[PriorityType] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

# Model to read a task (return to client)
class TaskRead(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    status: StatusType
    priority: PriorityType
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        # Pydantic v2: allows instantiation from ORM or objects with attributes
        from_attributes = True

# Model for task pagination
class TasksPage(BaseModel):
    items: List[TaskRead]
    total: int
    page: int
    page_size: int

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    assignee: Optional[UserOut] = None
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True
