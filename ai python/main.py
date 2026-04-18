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
        }

    matched_words = target_words.intersection(resume_words)
    match_ratio = len(matched_words) / len(target_words)

    resume_signal = min(len(resume_words) / 100.0, 1.0)
    confidence = clamp((match_ratio * 0.7) + (resume_signal * 0.3))

    return {
        "matching_score": round(clamp(match_ratio), 4),
        "confidence_score": round(confidence, 4),
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
