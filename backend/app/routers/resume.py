from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeOut
from app.utils.dependencies import get_current_user
from app.utils.file_handler import validate_file, save_file
from app.services.resume_parser import extract_text, parse_resume

import os

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = validate_file(file)
    file_path = save_file(file, ext)

    raw_text = extract_text(file_path, ext)
    parsed = parse_resume(raw_text)

    new_resume = Resume(
        owner_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        candidate_name=parsed.get("candidate_name"),
        email=parsed.get("email"),
        phone=parsed.get("phone"),
        raw_text=raw_text,
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume


@router.get("/", response_model=list[ResumeOut])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumes = (
        db.query(Resume)
        .filter(Resume.owner_id == current_user.id)
        .order_by(Resume.uploaded_at.desc())
        .all()
    )
    return resumes


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    if resume.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this resume.")

    if resume.file_path and os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)  # cascade also deletes related analyses
    db.commit()

    return None