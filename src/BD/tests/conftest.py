import sys
import pathlib
import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from types import SimpleNamespace

# Make sure the `BD` package is importable when running tests from repo root
ROOT_DIR = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# App imports
from app.core.database import Base, get_db
from app.models.user import User
from app.models.project import Project


# Use SQLite in-memory for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
# Use StaticPool so the same in-memory database is reused across connections
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Import models so they register with Base.metadata, then create all tables
from app.models import user as model_user
from app.models import project as model_project
from app.models import task as model_task
from app.models import project_member as model_project_member
from app.models import comment as model_comment

# Create all tables registered on Base.metadata (safer for in-memory DB)
Base.metadata.create_all(bind=engine)


# Seed a test user and project (once)
db = TestingSessionLocal()
test_user = User(email="test@example.com", password_hash="pwd", name="Test User", is_active=True)
db.add(test_user)
db.commit()
db.refresh(test_user)

test_project = Project(name="Test Project", description="Test project description", owner_id=test_user.id, archived=False)
db.add(test_project)
db.commit()
db.refresh(test_project)

# Capture primitive IDs so objects are not accessed after session close
test_user_id = test_user.id
test_project_id = test_project.id
db.close()


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_get_current_active_user():
    # Return a lightweight object with an `id` attribute (primitive int)
    return SimpleNamespace(id=test_user_id)


# Apply dependency overrides to the FastAPI app
from app.core.security import get_current_active_user
from app.main import app

# Override app dependencies to use the testing DB and test user
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_active_user] = override_get_current_active_user


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def project_id():
    return test_project_id


@pytest.fixture(scope="module")
def user_id():
    return test_user_id
