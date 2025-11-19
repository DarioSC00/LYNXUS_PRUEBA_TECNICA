from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

# Database
from app.core.database import get_db

# CRUD operations
from app.crud.taskController import task_crud
from app.crud.projectController import project_crud  

# Schemas
from app.schemas.taskSchema import TaskCreate, TaskRead, TaskUpdate

# Authentication
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.task import TaskStatus, TaskPriority  # For filters

router = APIRouter()

# === PROJECT TASKS ROUTES ===

@router.post("/projects/{project_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new task in a project"""
    try:
        # Verify that the project exists (no ownership check - collaborative)
        from app.models.project import Project
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        task = task_crud.create(
            db=db,
            obj_in=task_in,
            project_id=project_id,
            creator_id=current_user.id
        )
        return task
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("ERROR CREATING TASK:", str(e))
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating task: {str(e)}"
        )

@router.get("/projects/{project_id}/tasks", response_model=List[TaskRead])
def get_project_tasks(
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    overdue: Optional[bool] = Query(None, description="Filter overdue tasks"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get tasks from a project with filters"""
    # Verify that the project exists (no ownership check - collaborative)
    from app.crud.projectController import project_crud
    project = db.query(project_crud.model).filter(project_crud.model.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    tasks = task_crud.get_by_project(
        db=db,
        project_id=project_id,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        priority=priority,
        overdue=overdue
    )
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get task by ID"""
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    # In a collaborative board, any authenticated user can view tasks
    return task

@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a task"""
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    project = project_crud.get_by_id(db=db, project_id=task.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this task"
        )
    updated_task = task_crud.update(db=db, task_id=task_id, obj_in=task_update)
    return updated_task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a task"""
    task = task_crud.get_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    project = project_crud.get_by_id(db=db, project_id=task.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this task"
        )
    task_crud.delete(db=db, task_id=task_id)
    return {"message": "Task deleted successfully"}
