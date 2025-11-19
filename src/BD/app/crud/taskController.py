from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.task import Task, TaskStatus, TaskPriority
from app.schemas.taskSchema import TaskCreate, TaskUpdate
from typing import List, Optional
from datetime import datetime

class TaskCRUD:

    def create(self, db: Session, *, obj_in: TaskCreate, project_id: int, creator_id: int) -> Task:
        """Crear una nueva tarea en un proyecto"""
        task = Task(
            title=getattr(obj_in, "title", None),
            description=getattr(obj_in, "description", None),
            status=getattr(obj_in, "status", TaskStatus.TODO),
            priority=getattr(obj_in, "priority", TaskPriority.MEDIUM),
            due_date=getattr(obj_in, "due_date", None),
            project_id=project_id,
            assignee_id=getattr(obj_in, "assignee_id", None) or creator_id
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def get_by_project(
        self,
        db: Session,
        *,
        project_id: int,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
        overdue: Optional[bool] = None
    ) -> List[Task]:
        """Obtener tareas de un proyecto con filtros"""
        query = db.query(Task).filter(Task.project_id == project_id)

        if search:
            query = query.filter(Task.title.ilike(f"%{search}%"))

        if status:
            query = query.filter(Task.status == status)

        if priority:
            query = query.filter(Task.priority == priority)

        if overdue is not None:
            now = datetime.utcnow()
            if overdue:
                query = query.filter(Task.due_date != None, Task.due_date < now)
            else:
                query = query.filter((Task.due_date == None) | (Task.due_date >= now))

        return query.offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, *, task_id: int) -> Optional[Task]:
        """Obtener tarea por ID"""
        return db.query(Task).filter(Task.id == task_id).first()

    def update(self, db: Session, *, task_id: int, obj_in: TaskUpdate) -> Optional[Task]:
        """Actualizar tarea"""
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return None

        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        db.commit()
        db.refresh(task)
        return task

    def delete(self, db: Session, *, task_id: int) -> bool:
        """Eliminar tarea"""
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return False
        db.delete(task)
        db.commit()
        return True

    def count_total(self, db: Session, *, project_id: int, search: Optional[str] = None, status: Optional[TaskStatus] = None, priority: Optional[TaskPriority] = None) -> int:
        """Contar total de tareas para paginación"""
        query = db.query(Task).filter(Task.project_id == project_id)
        if search:
            query = query.filter(Task.title.ilike(f"%{search}%"))
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        return query.count()

# Instancia global para usar en las rutas
task_crud = TaskCRUD()