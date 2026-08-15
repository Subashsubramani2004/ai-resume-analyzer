from pydantic import BaseModel
from datetime import datetime


class ResumeOut(BaseModel):
    id: int
    filename: str
    candidate_name: str | None = None
    email: str | None = None
    phone: str | None = None
    uploaded_at: datetime

    class Config:
        from_attributes = True