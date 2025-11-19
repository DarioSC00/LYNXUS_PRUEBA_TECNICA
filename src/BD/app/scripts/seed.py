"""
Seed script to populate the database with sample data.

Creates:
- 3 users
- 2 projects
- 10+ tasks with different statuses and priorities
- Comments on tasks

Run:
    python -m app.scripts.seed
Or from the BD project root:
    python app/scripts/seed.py
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.models.comment import Comment


def create_seed_data():
    """Create sample data"""
    db: Session = SessionLocal()
    
    try:
        print("🌱 Starting data seed...")
        
        # Clean existing data (optional, comment if you don't want to delete)
        print("🧹 Cleaning existing data...")
        db.query(Comment).delete()
        db.query(Task).delete()
        db.query(Project).delete()
        db.query(User).delete()
        db.commit()
        
        # Create users
        print("👥 Creating users...")
        users = [
            User(
                name="Ruben Salazar",
                email="ruben@example.com",
                password_hash=get_password_hash("password123"),
                is_active=True
            ),
            User(
                name="Maria Garcia",
                email="maria@example.com",
                password_hash=get_password_hash("password123"),
                is_active=True
            ),
            User(
                name="Carlos Lopez",
                email="carlos@example.com",
                password_hash=get_password_hash("password123"),
                is_active=False
            ),
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        for user in users:
            db.refresh(user)
        
        print(f"✅ Created {len(users)} users")
        
        # Create projects
        print("📁 Creating projects...")
        projects = [
            Project(
                name="Sistema de Gestión de Tareas",
                description="Plataforma colaborativa para gestionar proyectos y tareas del equipo",
                owner_id=users[0].id,
                archived=False
            ),
            Project(
                name="Rediseño del sitio web",
                description="Actualización completa del diseño y UX del sitio web corporativo",
                owner_id=users[1].id,
                archived=False
            ),
        ]
        
        for project in projects:
            db.add(project)
        db.commit()
        
        for project in projects:
            db.refresh(project)
        
        print(f"✅ Created {len(projects)} projects")
        
        # Create tasks for the first project
        print("📝 Creating tasks...")
        
        now = datetime.now()
        
        tasks_project_1 = [
            Task(
                title="Configurar entorno de desarrollo",
                description="Instalar dependencias, configurar Docker y base de datos",
                status='done',
                priority='high',
                due_date=now - timedelta(days=5),
                project_id=projects[0].id,
                assignee_id=users[0].id
            ),
            Task(
                title="Diseñar modelos de datos",
                description="Crear modelos para User, Project, Task y Comment con sus relaciones",
                status='done',
                priority='high',
                due_date=now - timedelta(days=3),
                project_id=projects[0].id,
                assignee_id=users[0].id
            ),
            Task(
                title="Implementar autenticación JWT",
                description="Sistema de registro, login y protección de rutas con JWT",
                status='done',
                priority='high',
                due_date=now - timedelta(days=2),
                project_id=projects[0].id,
                assignee_id=users[1].id
            ),
            Task(
                title="Crear endpoints de proyectos",
                description="CRUD completo para proyectos con paginación y búsqueda",
                status='doing',
                priority='medium',
                due_date=now + timedelta(days=2),
                project_id=projects[0].id,
                assignee_id=users[0].id
            ),
            Task(
                title="Crear endpoints de tareas",
                description="CRUD de tareas con filtros por estado, prioridad y fecha límite",
                status='doing',
                priority='medium',
                due_date=now + timedelta(days=3),
                project_id=projects[0].id,
                assignee_id=users[1].id
            ),
            Task(
                title="Implementar sistema de comentarios",
                description="Permitir agregar y eliminar comentarios en las tareas",
                status='todo',
                priority='low',
                due_date=now + timedelta(days=5),
                project_id=projects[0].id,
                assignee_id=users[0].id
            ),
            Task(
                title="Frontend: Páginas de proyectos y usuarios",
                description="Crear interfaces consistentes para listar proyectos y usuarios",
                status='todo',
                priority='medium',
                due_date=now + timedelta(days=7),
                project_id=projects[0].id,
                assignee_id=users[1].id
            ),
            Task(
                title="Documentación del API",
                description="Completar documentación en FastAPI /docs y README",
                status='todo',
                priority='low',
                due_date=now + timedelta(days=10),
                project_id=projects[0].id,
                assignee_id=None
            ),
        ]
        
        # Tareas para el segundo proyecto
        tasks_project_2 = [
            Task(
                title="Análisis de competencia",
                description="Investigar tendencias de diseño web actuales y competidores",
                status='done',
                priority='medium',
                due_date=now - timedelta(days=7),
                project_id=projects[1].id,
                assignee_id=users[1].id
            ),
            Task(
                title="Wireframes de página principal",
                description="Crear wireframes de baja fidelidad para la home",
                status='doing',
                priority='high',
                due_date=now + timedelta(days=1),
                project_id=projects[1].id,
                assignee_id=users[1].id
            ),
            Task(
                title="Diseño de sistema de componentes",
                description="Definir paleta de colores, tipografías y componentes reutilizables",
                status='todo',
                priority='high',
                due_date=now + timedelta(days=4),
                project_id=projects[1].id,
                assignee_id=users[2].id
            ),
            Task(
                title="Implementar diseño responsive",
                description="Asegurar que el diseño funcione en móvil, tablet y desktop",
                status='todo',
                priority='medium',
                due_date=now + timedelta(days=8),
                project_id=projects[1].id,
                assignee_id=None
            ),
        ]
        
        all_tasks = tasks_project_1 + tasks_project_2
        
        for task in all_tasks:
            db.add(task)
        db.commit()
        
        for task in all_tasks:
            db.refresh(task)
        
        print(f"✅ Created {len(all_tasks)} tasks")
        
        # Create comments
        print("💬 Creating comments...")
        
        comments = [
            # Comments on task 1 (Setup environment)
            Comment(
                body="Ya está configurado Docker Compose con PostgreSQL, FastAPI y Next.js",
                task_id=all_tasks[0].id,
                author_id=users[0].id
            ),
            Comment(
                body="Excelente trabajo! El entorno funciona perfectamente",
                task_id=all_tasks[0].id,
                author_id=users[1].id
            ),
            
            # Comments on task 4 (Project endpoints)
            Comment(
                body="Los endpoints básicos ya están funcionando, falta agregar los filtros avanzados",
                task_id=all_tasks[3].id,
                author_id=users[0].id
            ),
            Comment(
                body="¿Necesitamos paginación en la lista de proyectos?",
                task_id=all_tasks[3].id,
                author_id=users[1].id
            ),
            Comment(
                body="Sí, implementar paginación con page y page_size",
                task_id=all_tasks[3].id,
                author_id=users[0].id
            ),
            
            # Comments on task 5 (Task endpoints)
            Comment(
                body="Implementados los filtros por estado y prioridad",
                task_id=all_tasks[4].id,
                author_id=users[1].id
            ),
            
            # Comments on task 9 (Competition analysis)
            Comment(
                body="Revisar sitios de Vercel, Netlify y Railway para inspiración",
                task_id=all_tasks[8].id,
                author_id=users[1].id
            ),
            
            # Comments on task 10 (Wireframes)
            Comment(
                body="Los wireframes están casi listos, enviando para revisión",
                task_id=all_tasks[9].id,
                author_id=users[1].id
            ),
            Comment(
                body="Se ven muy bien, solo ajustar el spacing en el footer",
                task_id=all_tasks[9].id,
                author_id=users[0].id
            ),
        ]
        
        for comment in comments:
            db.add(comment)
        db.commit()
        
        print(f"✅ Created {len(comments)} comments")
        
        print("\n✨ Seed completed successfully!")
        print("\n📊 Summary:")
        print(f"   - {len(users)} users")
        print(f"   - {len(projects)} projects")
        print(f"   - {len(all_tasks)} tasks")
        print(f"   - {len(comments)} comments")
        print("\n🔐 Test credentials:")
        print("   Email: ruben@example.com | Password: password123")
        print("   Email: maria@example.com | Password: password123")
        print("   Email: carlos@example.com | Password: password123")
        
    except Exception as e:
        print(f"❌ Error during seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_seed_data()
