from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

# Define statuses as Enum
class TaskStatus(str, enum.Enum):
    TODO = "todo"
    DOING = "doing" 
    DONE = "done"

# Define priorities as Enum  
class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(Base):
    __tablename__ = "tasks"
    
    # Main fields
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)  # For search
    description = Column(Text, nullable=True)  # Text for long descriptions
    
    # Status and priority as strings
    status = Column(String(20), nullable=False, default="todo", index=True)
    priority = Column(String(20), nullable=False, default="medium", index=True)
    
    # Due date
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)  # Index to filter overdue
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status.value})>"