from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # 👈 added

    job_title = Column(String, nullable=True)
    job_description = Column(Text, nullable=False)

    matched_skills = Column(Text, nullable=True)
    missing_skills = Column(Text, nullable=True)
    ats_score = Column(Float, nullable=False)
    ai_suggestions = Column(Text, nullable=True)   # 👈 added — filled in Phase 9

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resume = relationship("Resume", back_populates="analyses")