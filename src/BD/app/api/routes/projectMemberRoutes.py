from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.project_member import project_members
from app.schemas.userSchema import UserOut
from pydantic import BaseModel

router = APIRouter()


class AddMemberRequest(BaseModel):
    user_id: int


@router.post("/{project_id}/members", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def add_member_to_project(
    project_id: int,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a member to the project (any authenticated user can do it)"""
    
    # Verify that the project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verify that the user to add exists
    user_to_add = db.query(User).filter(User.id == request.user_id).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    if user_to_add in project.members:
        raise HTTPException(status_code=400, detail="User is already a project member")
    
    # Add member
    project.members.append(user_to_add)
    db.commit()
    db.refresh(user_to_add)
    
    return user_to_add


@router.get("/{project_id}/members", response_model=List[UserOut])
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all members of a project"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Any authenticated user can view project members
    return project.members


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member_from_project(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a member from the project (any authenticated user can do it)"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Find the user to remove
    user_to_remove = db.query(User).filter(User.id == user_id).first()
    if not user_to_remove:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if they are a member
    if user_to_remove not in project.members:
        raise HTTPException(status_code=400, detail="User is not a project member")
    
    # Remove member
    project.members.remove(user_to_remove)
    db.commit()
    
    return None
