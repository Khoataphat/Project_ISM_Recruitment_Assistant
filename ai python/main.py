import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

from models import MatchingEngine
from parser import ai_resume_parser, extract_text_from_pdf


ENGINE = MatchingEngine()


def score_application(payload: dict) -> dict:
    resume_path = payload.get("resume_path", "")
    job = payload.get("job", {})
    candidate_name = payload.get("candidate_name", "")
    candidate_email = payload.get("candidate_email", "")

    if not resume_path or not os.path.exists(resume_path):
        raise FileNotFoundError("Resume file not found")

    resume_text = extract_text_from_pdf(resume_path)
    if not resume_text:
        raise ValueError("Could not extract text from the resume")

    job_title = job.get("title", "")
    job_description = job.get("description", "")
    requirements = job.get("requirements", []) or []
    benefits = job.get("benefits", []) or []

    target_parts = [job_title, job_description]
    target_parts.extend(str(item) for item in requirements if item)
    target_parts.extend(str(item) for item in benefits if item)
    target_text = " ".join(part for part in target_parts if part).strip()

    cv_data = ai_resume_parser(resume_text)
    if not cv_data:
        raise ValueError("Could not parse structured candidate data from the resume")

    cv_data.setdefault("full_name", candidate_name or None)
    cv_data.setdefault("email", candidate_email or None)
    if not cv_data.get("full_name") and candidate_name:
        cv_data["full_name"] = candidate_name
    if not cv_data.get("email") and candidate_email:
        cv_data["email"] = candidate_email

    skills_list = cv_data.get("skills", []) or []

    if not target_text:
        return {
            "matching_score": 0.0,
            "confidence_score": 0.2,
            "summary": "Resume was parsed, but no job description was provided for matching.",
            "candidate_data": cv_data,
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

    matching_result = ENGINE.calculate_match(skills_list, target_text)
    matching_score = float(matching_result.get("ai_matching_score", 0.0) or 0.0)
    confidence_score = float(matching_result.get("confidence_score", 0.0) or 0.0)
    top_level_summary = matching_result.get("ai_summary") or f"AI matching completed for {job_title or 'the role'}."

    return {
        "matching_score": round(matching_score, 4),
        "confidence_score": round(confidence_score, 4),
        "summary": top_level_summary,
        "candidate_data": cv_data,
        "matching_data": matching_result,
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
