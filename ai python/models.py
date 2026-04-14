import json
import os
from sentence_transformers import SentenceTransformer, util
import google.genai as genai
from google.genai import types
from huggingface_hub import login
from dotenv import load_dotenv

load_dotenv()

# Đăng nhập vào HuggingFace bằng Token
if os.getenv("HF_TOKEN"):
    login(token=os.getenv("HF_TOKEN"))

class MatchingEngine:
    def __init__(self):
        print("--- Đang khởi tạo bộ não AI (Task 2)... ---")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        print("--- AI đã sẵn sàng! ---")

    def calculate_match(self, cv_skills, jd_text):
        # 1. Tính điểm Cosine Similarity (Toán học)
        cv_text = ", ".join(cv_skills)
        embeddings = self.model.encode([cv_text, jd_text], convert_to_tensor=True)
        score = util.cos_sim(embeddings[0], embeddings[1])
        final_score = round(float(score[0][0]) * 100, 2)

        # 2. Nâng cấp Schema để có thêm phần giải thích (ai_explanation)
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "ai_summary": {"type": "STRING"},
                "ai_explanation": { # Phần giải thích chi tiết các con số
                    "type": "OBJECT",
                    "properties": {
                        "score_reason": {"type": "STRING"}, # Tại sao điểm matching lại như vậy
                        "radar_breakdown": {"type": "STRING"} # Giải thích các cột trong biểu đồ radar
                    }
                },
                "skills_radar": {
                    "type": "OBJECT",
                    "properties": {
                        "Technical": {"type": "INTEGER"},
                        "Experience": {"type": "INTEGER"},
                        "Soft Skills": {"type": "INTEGER"},
                        "Education": {"type": "INTEGER"},
                        "Overall": {"type": "INTEGER"}
                    }
                }
            },
            "required": ["ai_summary", "ai_explanation", "skills_radar"]
        }

        # 3. Nâng cấp Prompt để "ép" AI phải tư vấn kỹ hơn
        prompt = f"""
        Bạn là chuyên gia nhân sự AI cấp cao. Hãy phân tích độ khớp giữa:
        Kỹ năng ứng viên: {cv_text}
        Yêu cầu công việc (JD): {jd_text}
        Điểm toán học Cosine Similarity hiện tại là: {final_score}%

        Nhiệm vụ:
        1. Viết 2-3 câu tóm tắt (ai_summary).
        2. Tại 'score_reason': Giải thích tại sao điểm toán học ({final_score}%) lại ra con số đó. (Ví dụ: Do thừa kỹ năng chuyên sâu nhưng thiếu kỹ năng cơ bản, hoặc do ứng viên overqualified).
        3. Tại 'radar_breakdown': Giải thích logic đằng sau các con số trong skills_radar. Đặc biệt chú ý: Tại sao Experience lại cao/thấp dù số năm kinh nghiệm là bao nhiêu?
        4. Đánh giá điểm skills_radar từ 0-100.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=response_schema
                )
            )
            ai_analysis = response.parsed
        except Exception as e:
            print(f"Lỗi khi gọi Gemini: {e}")
            ai_analysis = {
                "ai_summary": "Không thể tạo tóm tắt.",
                "ai_explanation": {
                    "score_reason": "Đã xảy ra lỗi khi phân tích lý do.",
                    "radar_breakdown": "Đã xảy ra lỗi khi phân tích biểu đồ."
                },
                "skills_radar": {
                    "Technical": 0, "Experience": 0, "Soft Skills": 0, "Education": 0, "Overall": 0
                }
            }
        
        def get_val(obj, key):
            if isinstance(obj, dict):
                return obj.get(key)
            return getattr(obj, key, None)

        return {
            "ai_matching_score": final_score,
            "ai_summary": get_val(ai_analysis, "ai_summary"),
            "ai_explanation": get_val(ai_analysis, "ai_explanation"),
            "skills_radar": get_val(ai_analysis, "skills_radar")
        }

"""
# --- TEST ---
if __name__ == "__main__":
    engine = MatchingEngine()
    skills = ["Java", "Spring Boot", "MySQL", "English Communication"]
    jd = "Tuyển lập trình viên Java, ưu tiên biết Spring và có kỹ năng giao tiếp tốt."
    
    result = engine.calculate_match(skills, jd)
    print("\n--- KẾT QUẢ AI MATCHING ---")
    print(json.dumps(result, indent=4, ensure_ascii=False))
"""