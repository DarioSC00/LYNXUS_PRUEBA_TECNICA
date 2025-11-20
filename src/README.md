# 📋 Lynxus Task - Gestor de Tareas Colaborativo

Sistema completo de gestión de proyectos y tareas con autenticación, comentarios y colaboración en equipo.

## 🚀 Stack Tecnológico

### Backend
- **FastAPI** 0.121.2 - Framework web moderno y rápido
- **PostgreSQL** 15 - Base de datos relacional
- **SQLAlchemy** 2.0.44 - ORM para Python
- **Alembic** 1.17.1 - Migraciones de base de datos
- **Pydantic** 2.12.4 - Validación de datos
- **JWT** - Autenticación basada en tokens
- **Uvicorn** 0.38.0 - Servidor ASGI

### Frontend
- **Next.js** 16.0.1 - Framework React con App Router
- **React** 19.2.0 - Biblioteca UI
- **Material-UI** 7.3.5 - Componentes UI
- **TypeScript** 5 - Tipado estático
- **React Toastify** - Notificaciones

### Infraestructura
- **Docker** & **Docker Compose** - Contenedorización
- **PostgreSQL** - Base de datos en contenedor
- **Nginx** (producción) - Servidor web

## 📁 Estructura del Proyecto

```
PruebaTecnicaLynxus/
├── BD/                          # Backend (FastAPI)
│   ├── alembic/                # Migraciones de base de datos
│   │   ├── versions/          # Scripts de migración
│   │   └── env.py            # Configuración Alembic
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies.py
│   │   │   └── routes/       # Endpoints REST
│   │   ├── core/
│   │   │   ├── auth.py       # Lógica de autenticación
│   │   │   ├── config.py     # Configuración
│   │   │   ├── database.py   # Conexión DB
│   │   │   └── security.py   # Seguridad
│   │   ├── crud/             # Operaciones CRUD
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── schemas/          # Esquemas Pydantic
│   │   ├── scripts/
│   │   │   └── seed.py       # Datos de ejemplo
│   │   └── main.py           # Punto de entrada
│   ├── Dockerfile            # Imagen Docker backend
│   ├── requirements.txt      # Dependencias Python
│   └── alembic.ini          # Config Alembic
│
├── Front/apps/web/           # Frontend (Next.js)
│   ├── src/
│   │   ├── app/             # App Router
│   │   │   ├── (protected)/ # Rutas protegidas
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── features/        # Componentes por feature
│   │   │   ├── projectComponents/
│   │   │   ├── taskComponents/
│   │   │   ├── userComponents/
│   │   │   └── universalComponents/
│   │   ├── providers/       # Providers React
│   │   ├── routes/         # Configuración rutas
│   │   └── theme/          # Tema Material-UI
│   ├── Dockerfile          # Imagen Docker frontend
│   ├── package.json
│   └── next.config.ts
│
├── packages/shared/         # Código compartido
├── docker-compose.yml       # Orquestación de servicios
├── .gitignore
└── README.md               # Este archivo
```

## 🔧 Requisitos Previos

- **Docker** 20.10+ y **Docker Compose** 2.0+
- **Node.js** 20 LTS (solo para desarrollo local)
- **Python** 3.11+ (solo para desarrollo local)
- **pnpm** 8+ (solo para desarrollo local)

## ⚡ Inicio Rápido con Docker (Recomendado)

### 1. Clonar el repositorio

```bash
git clone https://github.com/DarioSC00/PruebaTecnicaLynxus.git
cd PruebaTecnicaLynxus
```

### 2. Configurar variables de entorno

```bash
# Backend - Copiar y editar
cp BD/.env.example BD/.env

# Frontend - Copiar y editar
cp Front/apps/web/.env.example Front/apps/web/.env.local
```

### 3. Levantar todos los servicios

```bash
docker-compose up --build
```

Esto levantará:
- **PostgreSQL** en `localhost:5432`
- **Backend API** en `http://localhost:8000`
- **Frontend Web** en `http://localhost:3000`

### 4. Acceder a la aplicación

- **Aplicación**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc

### 5. Datos de prueba (opcional)

El seed se ejecuta automáticamente. Credenciales de prueba:

```
Admin:
Email: admin@lynxus.com
Password: admin123

Usuario 1:
Email: john.doe@lynxus.com
Password: password123

Usuario 2:
Email: jane.smith@lynxus.com
Password: password123
```

## 🛠️ Desarrollo Local (Sin Docker)

### Backend

```bash
cd BD

# Crear entorno virtual
python -m venv .venv

# Activar entorno (Windows)
.venv\Scripts\activate

# Activar entorno (Linux/Mac)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Editar .env con tus valores

# Ejecutar migraciones
alembic upgrade head

# Poblar datos de ejemplo (opcional)
python app/scripts/seed.py

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd Front/apps/web

# Instalar dependencias
# pnpm install
# Alternativa con npm:
# npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
# pnpm dev
# Alternativa con npm:
# npm run dev
```

## 🗄️ Base de Datos

### Migraciones con Alembic

```bash
cd BD

# Ver estado actual
alembic current

# Ver historial
alembic history

# Crear nueva migración (autogenerada)
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Revertir todas las migraciones
alembic downgrade base
```

### Modelo de Datos

- **User**: Usuarios del sistema (id, email, password_hash, name, created_at)
- **Project**: Proyectos (id, name, description, owner_id, archived, created_at)
- **Task**: Tareas (id, title, description, status, priority, due_date, project_id, assignee_id, created_at, updated_at)
- **Comment**: Comentarios (id, body, task_id, author_id, created_at)
- **project_members**: Relación muchos a muchos entre Project y User

## 📚 API Endpoints

### Autenticación
- `POST /users/register` - Registrar nuevo usuario
- `POST /users/login` - Iniciar sesión (devuelve JWT)

### Proyectos
- `GET /projects?q=&page=&page_size=` - Listar proyectos (paginado, búsqueda)
- `POST /projects` - Crear proyecto
- `GET /projects/{id}` - Obtener detalles
- `PATCH /projects/{id}` - Actualizar proyecto
- `DELETE /projects/{id}` - Eliminar/archivar proyecto

### Tareas
- `GET /projects/{id}/tasks?status=&priority=&q=` - Listar tareas por proyecto
- `POST /projects/{id}/tasks` - Crear tarea
- `GET /tasks/{id}` - Obtener detalles
- `PATCH /tasks/{id}` - Actualizar tarea
- `DELETE /tasks/{id}` - Eliminar tarea
- `GET /tasks?q=&status=&priority=` - Listar todas las tareas

### Comentarios
- `GET /tasks/{id}/comments` - Listar comentarios de tarea
- `POST /tasks/{id}/comments` - Crear comentario
- `DELETE /comments/{id}` - Eliminar comentario (solo autor)

### Miembros de Proyecto
- `GET /projects/{id}/members` - Listar miembros
- `POST /projects/{id}/members` - Agregar miembro
- `DELETE /projects/{id}/members/{user_id}` - Remover miembro

## 🎨 Características Principales

### Autenticación y Seguridad
- ✅ Registro de usuarios con validación
- ✅ Login con JWT (tokens de 60 minutos)
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rutas protegidas en frontend y backend
- ✅ Refresh automático de sesión

### Gestión de Proyectos
- ✅ CRUD completo de proyectos
- ✅ Búsqueda y paginación
- ✅ Archivado de proyectos
- ✅ Gestión de miembros del equipo
- ✅ Sistema de permisos (owner)

### Gestión de Tareas
- ✅ CRUD completo de tareas
- ✅ Estados: Todo, Doing, Done
- ✅ Prioridades: Low, Medium, High
- ✅ Fechas de vencimiento
- ✅ Asignación de responsables
- ✅ Filtros por estado, prioridad, vencidas
- ✅ Búsqueda por título

### Comentarios
- ✅ Comentarios en tareas y proyectos
- ✅ Solo el autor puede eliminar sus comentarios
- ✅ Timestamps y avatares

### UX/UI
- ✅ Interfaz responsive (Material-UI)
- ✅ Tema morado con gradientes
- ✅ Modales unificados XL
- ✅ Confirmaciones antes de eliminar
- ✅ Indicadores de carga
- ✅ Notificaciones toast
- **Notificaciones:** Las notificaciones en cliente se implementan con `React-Toastify`.
- ✅ Navegación por teclado

## 🧪 Pruebas

```bash
# Backend (próximamente)
cd BD
pytest

# Frontend (próximamente)
cd Front/apps/web
pnpm test
```

## 📦 Docker Commands

```bash
# Levantar servicios
docker-compose up

# Levantar en segundo plano
docker-compose up -d

# Reconstruir imágenes
docker-compose up --build

# Ver logs
docker-compose logs -f

# Ver logs de un servicio
docker-compose logs -f api

# Parar servicios
docker-compose down

# Parar y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# Ejecutar comando en contenedor
docker-compose exec api bash
docker-compose exec web sh

# Ver estado de servicios
docker-compose ps
```

## 🔍 Troubleshooting

### Error: "Puerto ya en uso"
```bash
# Ver qué usa el puerto
netstat -ano | findstr :8000

# Cambiar puerto en docker-compose.yml o .env
```

### Error de conexión a base de datos
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs de base de datos
docker-compose logs db

# Recrear volumen (CUIDADO: borra datos)
docker-compose down -v
docker-compose up
```

### Migraciones no se aplican
```bash
# Entrar al contenedor
docker-compose exec api bash

# Ejecutar migraciones manualmente
alembic upgrade head
```

## 🚀 Despliegue

### Variables de Entorno de Producción

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<generar-clave-segura-min-32-chars>
JWT_EXPIRES_IN=3600
DEBUG=False
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.tupagina.com
```

## 📝 Decisiones Técnicas

### ¿Por qué PostgreSQL en lugar de MySQL?
- Requisito obligatorio de la prueba técnica
- Mejor soporte para JSON, arrays y tipos avanzados
- ACID completo y mejor manejo de concurrencia
- Excelente rendimiento en queries complejas

### ¿Por qué Next.js App Router?
- SSR y SSG nativos para mejor SEO
- Routing basado en archivos (más intuitivo)
- React Server Components
- Mejor performance out-of-the-box

### ¿Por qué Material-UI?
- Componentes pre-construidos y accesibles
- Tema personalizable (gradiente morado)
- Responsive por defecto
- Documentación extensa

### ¿Por qué Docker?
- Entorno consistente entre desarrollo y producción
- Fácil setup (un solo comando)
- Aislamiento de servicios
- Escalabilidad

## 🗺️ Roadmap

### Implementado ✅
- [x] Autenticación y autorización
- [x] CRUD completo de proyectos, tareas, comentarios
- [x] Paginación y búsqueda
- [x] Filtros avanzados
- [x] Miembros de equipo
- [x] UI responsive con Material-UI
- [x] Docker + PostgreSQL + Alembic
- [x] Migraciones automáticas

### Pendiente 🔄
- [ ] Tests unitarios backend (pytest)
- [ ] Tests frontend (Jest/React Testing Library)
- [ ] CI/CD con GitHub Actions
- [ ] Internacionalización (i18n)
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Notificaciones push
- [ ] Export a PDF/Excel
- [ ] Dashboard con estadísticas
- [ ] Drag & drop para tareas

## 👥 Autor

**Dario Santacruz**
- GitHub: [@DarioSC00](https://github.com/DarioSC00)
- Repositorio: [PruebaTecnicaLynxus](https://github.com/DarioSC00/PruebaTecnicaLynxus)

## 📄 Licencia

Este proyecto fue desarrollado como prueba técnica para Lynxus.

---

⭐ Si te gustó este proyecto, ¡dale una estrella en GitHub!
