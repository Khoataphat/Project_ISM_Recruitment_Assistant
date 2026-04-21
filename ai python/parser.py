import json
import os
import re
from typing import Any

from dotenv import load_dotenv

try:
    import fitz  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    fitz = None

try:
    from google import genai  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    genai = None


load_dotenv()

_SKILL_KEYWORDS = {
    "python",
    "sql",
    "mysql",
    "postgresql",
    "sqlite",
    "pandas",
    "numpy",
    "scikit-learn",
    "sklearn",
    "tensorflow",
    "pytorch",
    "machine learning",
    "deep learning",
    "data analysis",
    "data visualization",
    "excel",
    "power bi",
    "tableau",
    "fastapi",
    "flask",
    "django",
    "git",
    "docker",
    "linux",
    "javascript",
    "typescript",
    "java",
    "spring boot",
    "c++",
    "html",
    "css",
    "react",
    "node.js",
    "nodejs",
    "communication",
    "english",
}


def extract_text_from_pdf(pdf_path: str) -> str | None:
    if fitz is not None:
        try:
            document = fitz.open(pdf_path)
            return "".join(page.get_text() for page in document).strip()
        except Exception:
            pass

    try:
        with open(pdf_path, "rb") as file:
            raw = file.read()
    except OSError:
        return None

    decoded = raw.decode("latin-1", errors="ignore")
    text_chunks = re.findall(r"\((.*?)\)", decoded)
    if text_chunks:
        return " ".join(text_chunks).strip()
    return decoded.strip() or None


def _normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _extract_email(text: str) -> str | None:
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return match.group(0) if match else None


def _extract_phone(text: str) -> str | None:
    match = re.search(r"(\+?\d[\d\s().-]{8,}\d)", text)
    return _normalize_space(match.group(1)) if match else None


def _extract_name(text: str) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines[:8]:
        if any(char.isdigit() for char in line):
            continue
        if "@" in line or len(line.split()) < 2 or len(line) > 60:
            continue
        return line.title()
    return None


def _extract_skills(text: str) -> list[str]:
    lower_text = text.lower()
    found = []
    for skill in sorted(_SKILL_KEYWORDS):
        if skill in lower_text:
            found.append(skill)
    return found[:20]


def _extract_years_of_experience(text: str) -> int:
    patterns = [
        r"(\d+)\+?\s+years? of experience",
        r"(\d+)\+?\s+năm kinh nghiệm",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    return 0


def _heuristic_resume_parser(cv_text: str) -> dict[str, Any]:
    skills = _extract_skills(cv_text)
    summary = "Candidate profile extracted with heuristic parsing."
    if skills:
        summary = f"Candidate profile extracted with heuristic parsing and {len(skills)} detected skills."

    return {
        "full_name": _extract_name(cv_text),
        "email": _extract_email(cv_text),
        "phone": _extract_phone(cv_text),
        "education": None,
        "years_of_experience": _extract_years_of_experience(cv_text),
        "skills": skills,
        "summary": summary,
    }


def _build_resume_prompt(cv_text: str) -> str:
    return f"""
You are an AI recruitment assistant. Extract the resume data below into valid JSON.

Rules:
- Return only JSON.
- Use null when information is missing.
- `skills` must be a list of concrete skill keywords.
- `years_of_experience` must be an integer.

Required JSON schema:
{{
  "full_name": "string | null",
  "email": "string | null",
  "phone": "string | null",
  "education": "string | null",
  "years_of_experience": 0,
  "skills": ["skill1", "skill2"],
  "summary": "short summary"
}}

Resume text:
{cv_text}
""".strip()


def ai_resume_parser(cv_text: str) -> dict[str, Any] | None:
    if not cv_text:
        return None

    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("AI_RESUME_MODEL", "gemini-2.0-flash")

    if api_key and genai is not None:
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=model_name,
                contents=_build_resume_prompt(cv_text),
                config={"response_mime_type": "application/json"},
            )
            parsed = json.loads(response.text)
            if isinstance(parsed, dict):
                parsed.setdefault("skills", [])
                parsed.setdefault("years_of_experience", 0)
                parsed.setdefault("summary", "Candidate profile extracted successfully.")
                return parsed
        except Exception:
            pass

    return _heuristic_resume_parser(cv_text)
