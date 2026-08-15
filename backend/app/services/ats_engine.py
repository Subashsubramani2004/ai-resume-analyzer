def calculate_ats_score(resume_skills: list[str], jd_skills: list[str]) -> dict:
    """
    Compares resume skills against job-required skills.
    Returns matched skills, missing skills, and a percentage score.
    """
    resume_set = {s.lower() for s in resume_skills}
    jd_set = {s.lower() for s in jd_skills}

    if not jd_set:
        # No required skills detected in JD — can't meaningfully score
        return {
            "matched_skills": [],
            "missing_skills": [],
            "ats_score": 0.0,
        }

    matched = jd_set & resume_set
    missing = jd_set - resume_set

    score = (len(matched) / len(jd_set)) * 100

    return {
        "matched_skills": sorted(matched),
        "missing_skills": sorted(missing),
        "ats_score": round(score, 2),
    }