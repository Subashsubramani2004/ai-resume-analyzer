import pdfplumber
from docx import Document
import re
import spacy

nlp = spacy.load("en_core_web_sm")

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")

# A small starter skill list — expand this over time.
COMMON_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Angular", "Vue",
    "FastAPI", "Django", "Flask", "Node.js", "Express", "SQL", "PostgreSQL",
    "MySQL", "MongoDB", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
    "Git", "REST API", "GraphQL", "HTML", "CSS", "Tailwind", "SQLAlchemy",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "spaCy",
    "pandas", "NumPy", "Linux", "CI/CD", "Agile", "JWT", "OAuth",
]


def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join(para.text for para in doc.paragraphs if para.text.strip())


def extract_text(file_path: str, ext: str) -> str:
    """Dispatch to the right extractor based on file extension."""
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported extension for text extraction: {ext}")


def extract_email(text: str) -> str | None:
    match = EMAIL_REGEX.search(text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = PHONE_REGEX.search(text)
    return match.group(0).strip() if match else None


def extract_name(text: str) -> str | None:
    """
    Try a heuristic first (first non-empty line, short, no digits/email),
    since resumes often have all-caps names that spaCy's NER misses.
    Fall back to spaCy NER on a title-cased version if the heuristic fails.
    """
    lines = [line.strip() for line in text.strip().split("\n") if line.strip()]
    if not lines:
        return None

    first_line = lines[0]

    looks_like_name = (
        1 <= len(first_line.split()) <= 5
        and not any(char.isdigit() for char in first_line)
        and "@" not in first_line
        and "email" not in first_line.lower()
        and "phone" not in first_line.lower()
    )

    if looks_like_name:
        return first_line.title()  # "VISHWA SUBASH S" -> "Vishwa Subash S"

    # Fallback: spaCy NER on first few lines, title-cased to help it recognize names
    first_lines = "\n".join(lines[:5])
    doc = nlp(first_lines.title())
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text

    return None


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for skill in COMMON_SKILLS:
        # \b = word boundary, so "sql" won't match inside "postgresql"
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill)
    return found

def parse_resume(text: str) -> dict:
    return {
        "candidate_name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
    }