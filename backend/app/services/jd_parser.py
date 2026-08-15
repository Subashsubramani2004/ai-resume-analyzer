from app.services.resume_parser import extract_skills


def parse_job_description(text: str) -> dict:
    """
    Extracts required skills from a pasted job description.
    Reuses the same skill dictionary/logic as resume parsing,
    so matching is apples-to-apples.
    """
    return {
        "required_skills": extract_skills(text),
    }