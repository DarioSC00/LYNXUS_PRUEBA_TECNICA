from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.crud.projectController import project_crud
from app.schemas.projectSchema import ProjectCreate, ProjectResponse, ProjectUpdate, ProjectOut  
from app.api.dependencies import get_current_active_user  
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.comment import Comment

router = APIRouter()

# === PROJECT ROUTES ===
@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new project"""
    try:
        project = project_crud.create(
            db=db,
            obj_in=project_in,
            owner_id=current_user.id
        )
        return project
    except Exception as e:
        print(f"❌ Error creating project: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}"
        )


@router.get("/")
def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of ALL projects (collaborative workspace) with pagination"""
    projects = project_crud.get_all(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )
    total = project_crud.count_total(
        db=db,
        search=search
    )
    
    # Calculate page number
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return {
        "items": projects,
        "total": total,
        "page": page,
        "page_size": limit
    }


# Endpoint GET /{project_id} moved to line 136 (read_project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update project by ID (any user can modify)"""
    updated_project = project_crud.update(
        db=db,
        project_id=project_id,
        obj_in=project_in
    )
    if not updated_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return updated_project


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete project by ID (any user can delete)"""
    success = project_crud.delete(
        db=db, 
        project_id=project_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return {"message": "Project deleted successfully"}


@router.get("/user/{user_id}", response_model=List[ProjectResponse])
def get_projects_by_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all projects (returns all since it's collaborative)"""
    projects = project_crud.get_all(db=db)
    return projects


@router.get("/{project_id}", response_model=ProjectOut)
def read_project(
    project_id: int, 
    db: Session = Depends(get_db)
):
    """Get project by ID with all its tasks, members and comments"""
    project = db.query(Project).options(
        selectinload(Project.owner),
        selectinload(Project.members),  # Load project members
        selectinload(Project.tasks).selectinload(Task.assignee),
        selectinload(Project.tasks).selectinload(Task.comments).selectinload(Comment.author),
        selectinload(Project.comments).selectinload(Comment.author)
    ).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
