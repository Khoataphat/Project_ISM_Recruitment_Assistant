import os
import re
from typing import Any

from dotenv import load_dotenv

try:
    from sentence_transformers import SentenceTransformer, util  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    SentenceTransformer = None
    util = None

try:
    from google import genai  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    genai = None


load_dotenv()


def clamp(value: float, min_value: float = 0.0, max_value: float = 1.0) -> float:
    return max(min_value, min(max_value, value))


def normalize_words(text: str) -> list[str]:
    return re.findall(r"[a-z0-9+#.-]+", text.lower())


class MatchingEngine:
    def __init__(self):
        self.embedding_model = None
        self.genai_client = None

        if SentenceTransformer is not None:
            try:
                self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                self.embedding_model = None

        api_key = os.getenv("GEMINI_API_KEY")
        if api_key and genai is not None:
            try:
                self.genai_client = genai.Client(api_key=api_key)
            except Exception:
                self.genai_client = None

    def _similarity_score(self, cv_skills: list[str], jd_text: str) -> float:
        cv_text = ", ".join(cv_skills).strip()
        jd_text = jd_text.strip()

        if not cv_text or not jd_text:
            return 0.0

        if self.embedding_model is not None and util is not None:
            try:
                embeddings = self.embedding_model.encode([cv_text, jd_text], convert_to_tensor=True)
                score = util.cos_sim(embeddings[0], embeddings[1])
                return clamp(float(score[0][0]))
            except Exception:
                pass

        cv_words = set(normalize_words(cv_text))
        jd_words = set(normalize_words(jd_text))
        if not cv_words or not jd_words:
            return 0.0
        return clamp(len(cv_words.intersection(jd_words)) / len(jd_words))

    def _build_default_analysis(self, score: float, cv_skills: list[str], jd_text: str) -> dict[str, Any]:
        skill_count = len([skill for skill in cv_skills if skill.strip()])
        jd_signal = len(set(normalize_words(jd_text)))
        technical = round(clamp(score * 1.25) * 100)
        experience = round(clamp((skill_count / 12.0) * 0.6 + score * 0.4) * 100)
        soft_skills = round(clamp(0.35 + score * 0.4) * 100)
        education = round(clamp(0.3 + score * 0.5) * 100)
        overall = round(score * 100)

        return {
            "ai_summary": (
                f"The candidate shows an estimated {overall}% match based on extracted resume skills "
                f"compared with the job description."
            ),
            "ai_explanation": {
                "score_reason": (
                    f"The score comes from semantic similarity between {skill_count} extracted candidate skills "
                    f"and the job description signal of {jd_signal} normalized keywords."
                ),
                "radar_breakdown": (
                    "Technical reflects direct skill alignment, Experience reflects resume depth inferred from "
                    "skill coverage, Soft Skills uses a conservative baseline, and Education is estimated from "
                    "overall profile completeness."
                ),
            },
            "skills_radar": {
                "Technical": technical,
                "Experience": experience,
                "Soft Skills": soft_skills,
                "Education": education,
                "Overall": overall,
            },
        }

    def _generate_ai_explanation(self, score: float, cv_skills: list[str], jd_text: str) -> dict[str, Any] | None:
        if self.genai_client is None:
            return None

        model_name = os.getenv("AI_MATCH_MODEL", "gemini-2.0-flash")
        cv_text = ", ".join(cv_skills)
        prompt = f"""
You are an AI recruitment analyst.
Given the candidate skills and job description below, produce JSON with:
- ai_summary
- ai_explanation.score_reason
- ai_explanation.radar_breakdown
- skills_radar.Technical
- skills_radar.Experience
- skills_radar.Soft Skills
- skills_radar.Education
- skills_radar.Overall

Rules:
- Return only JSON.
- Radar scores must be integers from 0 to 100.
- Keep the summary concise and practical.
- The current similarity score is {round(score * 100, 2)}%.

Candidate skills: {cv_text}
Job description: {jd_text}
""".strip()

        try:
            response = self.genai_client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={"response_mime_type": "application/json"},
            )
            if hasattr(response, "text") and response.text:
                import json

                parsed = json.loads(response.text)
                if isinstance(parsed, dict):
                    return parsed
        except Exception:
            return None

        return None

    def calculate_match(self, cv_skills: list[str], jd_text: str) -> dict[str, Any]:
        score = self._similarity_score(cv_skills, jd_text)
        analysis = self._generate_ai_explanation(score, cv_skills, jd_text) or self._build_default_analysis(
            score,
            cv_skills,
            jd_text,
        )

        return {
            "ai_matching_score": round(score, 4),
            "confidence_score": round(clamp(0.45 + score * 0.45), 4),
            "ai_summary": analysis.get("ai_summary"),
            "ai_explanation": analysis.get("ai_explanation"),
            "skills_radar": analysis.get("skills_radar"),
        }
