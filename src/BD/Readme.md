# Backend - Gestor de Tareas Colaborativo

API RESTful construida con **FastAPI** para gestionar proyectos, tareas, usuarios y comentarios.

## 🚀 Stack Tecnológico

- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validación de datos
- **PostgreSQL** - Base de datos relacional
- **Alembic** - Migraciones de base de datos
- **JWT** - Autenticación basada en tokens
- **Uvicorn** - Servidor ASGI

## 📁 Estructura del Proyecto

```
BD/
├── app/
│   ├── api/
│   │   ├── dependencies.py
│   │   └── routes/
│   │       ├── userRoutes.py
│   │       ├── projectRoutes.py
│   │       ├── taskRoutes.py
│   │       └── commentRoutes.py
│   ├── core/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── crud/
│   │   ├── userController.py
│   │   ├── projectController.py
│   │   ├── taskController.py
│   │   └── commentController.py
│   ├── models/
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   └── comment.py
│   ├── schemas/
│   │   ├── userSchema.py
│   │   ├── projectSchema.py
│   │   ├── taskSchema.py
│   │   └── commentSchema.py
│   ├── scripts/
│   │   └── seed.py
│   └── main.py
├── requirements.txt
└── Readme.md
```

## 🛠️ Instalación

### Requisitos Previos

- Python 3.11+
- PostgreSQL 15+
- pip o poetry

### Pasos

1. **Crear entorno virtual**

```bash
cd BD
python -m venv .venv
```

2. **Activar entorno virtual**

Windows:
```bash
.venv\Scripts\activate
```

Linux/Mac:
```bash
source .venv/bin/activate
```

3. **Instalar dependencias**

```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto BD:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/tasks_db

# JWT
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

5. **Crear base de datos**

```sql
CREATE DATABASE tasks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

6. **Ejecutar migraciones** (si usas Alembic)

```bash
alembic upgrade head
```

O crear las tablas directamente desde Python:

```python
from app.core.database import engine, Base
from app.models import user, project, task, comment

Base.metadata.create_all(bind=engine)
```

## 🌱 Seed de Datos

Para poblar la base de datos con datos de ejemplo:

```bash
python -m app.scripts.seed
```

Esto creará:
- ✅ 3 usuarios
- ✅ 2 proyectos
- ✅ 12 tareas con diferentes estados y prioridades
- ✅ 9 comentarios

**Credenciales de prueba:**
- Email: `ruben@example.com` | Password: `password123`
- Email: `maria@example.com` | Password: `password123`
- Email: `carlos@example.com` | Password: `password123`

## ▶️ Ejecutar el Servidor

```bash
uvicorn app.main:app --reload --port 8000
```

La API estará disponible en:
- **API**: http://localhost:8000
- **Documentación interactiva**: http://localhost:8000/docs
- **Documentación alternativa**: http://localhost:8000/redoc

## 📚 API Endpoints

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (devuelve JWT)

### Usuarios (protegido)

- `GET /users/` - Listar usuarios (paginado)
- `GET /users/{id}` - Obtener usuario por ID
- `PATCH /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario

### Proyectos (protegido)

- `GET /projects/` - Listar proyectos (con búsqueda y paginación)
- `POST /projects/` - Crear proyecto
- `GET /projects/{id}` - Obtener proyecto por ID
- `PATCH /projects/{id}` - Actualizar proyecto
- `DELETE /projects/{id}` - Eliminar proyecto

### Tareas (protegido)

- `GET /projects/{project_id}/tasks` - Listar tareas de un proyecto (con filtros)
- `POST /projects/{project_id}/tasks` - Crear tarea en un proyecto
- `GET /tasks/{id}` - Obtener tarea por ID
- `PUT /tasks/{id}` - Actualizar tarea
- `DELETE /tasks/{id}` - Eliminar tarea

**Filtros disponibles:**
- `status` - todo | doing | done
- `priority` - low | med | high
- `overdue` - true | false
- `search` - Buscar en título

### Comentarios (protegido)

- `GET /tasks/{task_id}/comments` - Listar comentarios de una tarea
- `POST /tasks/{task_id}/comments` - Crear comentario
- `DELETE /comments/{id}` - Eliminar comentario (solo autor)

## 🔐 Autenticación

Todas las rutas (excepto `/auth/*`) requieren autenticación JWT.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

## 🗄️ Modelos de Datos

### User
- `id` (PK)
- `email` (único)
- `name`
- `password_hash`
- `is_active`
- `created_at`, `updated_at`

### Project
- `id` (PK)
- `name`
- `description`
- `owner_id` (FK → User)
- `archived`
- `created_at`, `updated_at`

### Task
- `id` (PK)
- `title`
- `description`
- `status` (todo | doing | done)
- `priority` (low | med | high)
- `due_date`
- `project_id` (FK → Project)
- `assignee_id` (FK → User)
- `created_at`, `updated_at`

### Comment
- `id` (PK)
- `body`
- `task_id` (FK → Task)
- `author_id` (FK → User)
- `created_at`

## 🧪 Tests

```bash
pytest
```

## 📝 Notas de Desarrollo

- Todas las contraseñas se hashean con bcrypt
- Los tokens JWT expiran en 24 horas (configurable)
- La API usa validación Pydantic v2
- Los timestamps usan UTC
- Las relaciones usan lazy loading por defecto

