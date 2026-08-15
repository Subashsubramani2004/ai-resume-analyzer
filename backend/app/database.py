from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# The "engine" is the core interface to the database.
# connect_args is only needed for SQLite (it disallows multi-threaded access by default).
connect_args = {"check_same_thread": False} if "sqlite" in settings.database_url else {}

engine = create_engine(settings.database_url, connect_args=connect_args)

# SessionLocal is a factory that creates new DB sessions when called.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the class all our models will inherit from.
Base = declarative_base()

# Dependency function — FastAPI will call this per-request,
# hand the route a session, then close it afterward automatically.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    