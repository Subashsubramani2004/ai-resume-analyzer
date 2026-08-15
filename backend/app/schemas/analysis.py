from pydantic import BaseModel
from datetime import datetime


class AnalysisCreate(BaseModel):
    resume_id: int
    job_title: str | None = None
    job_description: str


class AnalysisOut(BaseModel):
    id: int
    resume_id: int
    job_title: str | None
    matched_skills: list[str]
    missing_skills: list[str]
    ats_score: float
    ai_suggestions: str | None = None   # 👈 added, will stay null until Phase 9
    created_at: datetime

    class Config:
        from_attributes = True