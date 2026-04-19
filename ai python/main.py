import json
import os
import re
from http.server import BaseHTTPRequestHandler, HTTPServer


def normalize_words(text: str) -> list[str]:
    return re.findall(r"[a-z0-9+#.-]+", text.lower())


def extract_resume_text(resume_path: str) -> str:
    with open(resume_path, "rb") as file:
        raw = file.read()

    decoded = raw.decode("latin-1", errors="ignore")

    # Very lightweight PDF text extraction for simple text PDFs.
    text_chunks = re.findall(r"\((.*?)\)", decoded)
    if text_chunks:
        return " ".join(text_chunks)

    return decoded


def clamp(value: float, min_value: float = 0.0, max_value: float = 1.0) -> float:
    return max(min_value, min(max_value, value))


def score_application(payload: dict) -> dict:
    resume_path = payload.get("resume_path", "")
    job = payload.get("job", {})
    candidate_name = payload.get("candidate_name", "")
    candidate_email = payload.get("candidate_email", "")

    if not resume_path or not os.path.exists(resume_path):
        raise FileNotFoundError("Resume file not found")

    resume_text = extract_resume_text(resume_path)
    resume_words = set(normalize_words(resume_text))

    job_title = job.get("title", "")
    job_description = job.get("description", "")
    requirements = job.get("requirements", []) or []

    target_text = " ".join([job_title, job_description, *requirements])
    target_words = set(normalize_words(target_text))

    if not target_words:
        return {
            "matching_score": 0.0,
            "confidence_score": 0.2,
            "candidate_data": {
                "full_name": candidate_name,
                "email": candidate_email,
                "education": None,
                "years_of_experience": 0,
                "skills": sorted(list(resume_words))[:12],
                "summary": "Resume processed successfully, but the target job description was empty.",
            },
            "matching_data": {
                "ai_matching_score": 0.0,
                "confidence_score": 0.2,
                "ai_summary": "No job requirements were provided, so the AI could not produce a meaningful match score.",
                "ai_explanation": {
                    "score_reason": "The job description did not contain enough keywords for semantic comparison.",
                    "radar_breakdown": "Technical 0, Experience 0, Soft Skills 0, Education 0, Overall 0.",
                },
                "skills_radar": {
                    "Technical": 0,
                    "Experience": 0,
                    "Soft Skills": 0,
                    "Education": 0,
                    "Overall": 0,
                },
            },
        }

    matched_words = target_words.intersection(resume_words)
    match_ratio = len(matched_words) / len(target_words)

    resume_signal = min(len(resume_words) / 100.0, 1.0)
    confidence = clamp((match_ratio * 0.7) + (resume_signal * 0.3))
    normalized_match = round(clamp(match_ratio), 4)
    normalized_confidence = round(confidence, 4)

    top_skills = sorted(list(matched_words))[:12]
    technical = round(clamp(match_ratio * 1.4, 0.0, 1.0) * 100)
    experience = round(clamp((resume_signal * 0.7) + (match_ratio * 0.3), 0.0, 1.0) * 100)
    soft_skills = round(clamp((resume_signal * 0.5) + (match_ratio * 0.2), 0.0, 1.0) * 100)
    education = round(clamp((match_ratio * 0.6) + 0.25, 0.0, 1.0) * 100)
    overall = round(normalized_match * 100)
    job_title = job.get("title", "the role")

    return {
        "matching_score": normalized_match,
        "confidence_score": normalized_confidence,
        "summary": f"Keyword matching suggests the resume has a {overall}% fit with {job_title}.",
        "candidate_data": {
            "full_name": candidate_name,
            "email": candidate_email,
            "education": None,
            "years_of_experience": 0,
            "skills": top_skills,
            "summary": f"Resume contains {len(resume_words)} normalized keywords and overlaps with {len(matched_words)} job keywords.",
        },
        "matching_data": {
            "ai_matching_score": normalized_match,
            "confidence_score": normalized_confidence,
            "ai_summary": f"The candidate overlaps with {len(matched_words)} of {len(target_words)} tracked job keywords.",
            "ai_explanation": {
                "score_reason": "The score is based on keyword overlap between the resume and the job title, description, and requirement fields.",
                "radar_breakdown": "Technical is driven by keyword overlap, Experience by resume signal density, Soft Skills by general text richness, and Education by baseline profile completeness.",
            },
            "skills_radar": {
                "Technical": technical,
                "Experience": experience,
                "Soft Skills": soft_skills,
                "Education": education,
                "Overall": overall,
            },
        },
    }


class AiRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/score":
            self._send_json(404, {"message": "Not found"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length)
            payload = json.loads(raw_body.decode("utf-8"))
            result = score_application(payload)
            self._send_json(200, result)
        except FileNotFoundError as error:
            self._send_json(400, {"message": str(error)})
        except json.JSONDecodeError:
            self._send_json(400, {"message": "Invalid JSON payload"})
        except Exception as error:  # noqa: BLE001
            self._send_json(500, {"message": str(error)})

    def log_message(self, format: str, *args):
        return


def run():
    host = os.environ.get("AI_HOST", "127.0.0.1")
    port = int(os.environ.get("AI_PORT", "8000"))
    server = HTTPServer((host, port), AiRequestHandler)
    print(f"AI service listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
