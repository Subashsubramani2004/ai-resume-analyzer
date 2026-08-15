from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One user -> many resumes. "resumes" doesn't exist as a DB column;
    # SQLAlchemy uses it to let us do user.resumes in Python code.
    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")