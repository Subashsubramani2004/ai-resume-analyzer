from google import genai
from app.config import settings

client = genai.Client(api_key=settings.gemini_api_key)


def generate_suggestions(resume_text: str, job_description: str, missing_skills: list[str]) -> str:
    missing_str = ", ".join(missing_skills) if missing_skills else "None — great match!"

    prompt = f"""You are a professional resume coach. Based on the resume and job description below, 
give 3-5 concise, actionable suggestions to improve the candidate's chances for this role.
Focus especially on how they could address these missing skills: {missing_str}

Resume:
{resume_text[:3000]}

Job Description:
{job_description[:2000]}

Respond with a short bulleted list only. No preamble."""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
    )
    return response.text