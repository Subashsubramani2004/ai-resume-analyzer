from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisCreate, AnalysisOut
from app.utils.dependencies import get_current_user
from app.services.jd_parser import parse_job_description
from app.services.resume_parser import extract_skills
from app.services.ats_engine import calculate_ats_score
from app.services.ai_service import generate_suggestions

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
def create_analysis(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = db.query(Resume).filter(Resume.id == payload.resume_id).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    if resume.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to use this resume.")

    resume_skills = extract_skills(resume.raw_text or "")
    jd_data = parse_job_description(payload.job_description)
    jd_skills = jd_data["required_skills"]

    result = calculate_ats_score(resume_skills, jd_skills)

    try:
        ai_text = generate_suggestions(
            resume_text=resume.raw_text or "",
            job_description=payload.job_description,
            missing_skills=result["missing_skills"],
        )
    except Exception as e:
        print(f"Gemini API call failed: {e}", flush=True)
        ai_text = "AI suggestions unavailable at this time."

    new_analysis = Analysis(
        resume_id=resume.id,
        owner_id=current_user.id,
        job_title=payload.job_title,
        job_description=payload.job_description,
        matched_skills=",".join(result["matched_skills"]),
        missing_skills=",".join(result["missing_skills"]),
        ats_score=result["ats_score"],
        ai_suggestions=ai_text,
    )

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)

    return AnalysisOut(
        id=new_analysis.id,
        resume_id=new_analysis.resume_id,
        job_title=new_analysis.job_title,
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        ats_score=new_analysis.ats_score,
        ai_suggestions=new_analysis.ai_suggestions,
        created_at=new_analysis.created_at,
    )


@router.get("/", response_model=list[AnalysisOut])
def list_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analyses = (
        db.query(Analysis)
        .filter(Analysis.owner_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return [
        AnalysisOut(
            id=a.id,
            resume_id=a.resume_id,
            job_title=a.job_title,
            matched_skills=a.matched_skills.split(",") if a.matched_skills else [],
            missing_skills=a.missing_skills.split(",") if a.missing_skills else [],
            ats_score=a.ats_score,
            ai_suggestions=a.ai_suggestions,
            created_at=a.created_at,
        )
        for a in analyses
    ]


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    if analysis.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this analysis.")

    return AnalysisOut(
        id=analysis.id,
        resume_id=analysis.resume_id,
        job_title=analysis.job_title,
        matched_skills=analysis.matched_skills.split(",") if analysis.matched_skills else [],
        missing_skills=analysis.missing_skills.split(",") if analysis.missing_skills else [],
        ats_score=analysis.ats_score,
        ai_suggestions=analysis.ai_suggestions,
        created_at=analysis.created_at,
    )


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    if analysis.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this analysis.")

    db.delete(analysis)
    db.commit()

    return None