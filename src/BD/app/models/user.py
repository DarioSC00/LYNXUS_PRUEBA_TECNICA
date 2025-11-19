from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.project_member import project_members

class User(Base):
    __tablename__ = "users"
    
    # Main fields
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=True)  # 🔧 Change Full_name → name
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships - Activate when you have other models
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan", foreign_keys="Project.owner_id")
    member_projects = relationship("Project", secondary=project_members, back_populates="members")
    assigned_tasks = relationship("Task", back_populates="assignee")
    comments = relationship("Comment", back_populates="author")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"  # 🔧 Fix here too