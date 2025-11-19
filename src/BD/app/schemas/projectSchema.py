from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .userSchema import UserOut
from .taskSchema import TaskOut
from .commentSchema import CommentOut

# --- Crear Proyecto ---
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None


# --- Actualizar Proyecto ---
class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None


# --- Respuesta del Proyecto ---
class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    archived: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # ✅ reemplaza orm_mode en Pydantic v2


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    archived: bool = False
    owner: Optional[UserOut] = None
    members: List[UserOut] = []  # Usuarios que trabajan en el proyecto
    tasks: List[TaskOut] = []
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True
