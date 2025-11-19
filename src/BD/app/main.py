from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Importar routers existentes
from app.api.routes import userRoutes, projectRoutes, taskRoutes, commentRoutes, projectCommentRoutes, projectMemberRoutes

app = FastAPI(title="API PruebaTecnicaLynxus")

# Allow localhost for development and Render URLs for production
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    # Add your Render frontend URL here when deployed
    os.getenv("FRONTEND_URL", ""),
]

# Remove empty strings from origins
origins = [origin for origin in origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],  # Allow all if no specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(userRoutes.router, prefix="/users", tags=["users"])
app.include_router(projectRoutes.router, prefix="/projects", tags=["projects"])
# Incluir taskRoutes sin prefijo porque las rutas dentro ya contienen /tasks y /projects/{id}/tasks
app.include_router(taskRoutes.router)
# Incluir commentRoutes sin prefijo porque las rutas ya contienen /tasks/{id}/comments y /comments/{id}
app.include_router(commentRoutes.router, tags=["comments"])
app.include_router(projectCommentRoutes.router, prefix="/projects", tags=["project-comments"])
app.include_router(projectMemberRoutes.router, prefix="/projects", tags=["project-members"])

@app.get("/", tags=["health"])
def read_root():
    return {"message": "API PruebaTecnicaLynxus OK"}
