import json
import os
from sentence_transformers import SentenceTransformer, util
import google.genai as genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

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

        # 2. Cấu hình Schema để ép Gemini trả về JSON chuẩn 100%
        # Cách này giúp loại bỏ hoàn toàn lỗi "Extra data"
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "ai_summary": {"type": "STRING"},
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
            "required": ["ai_summary", "skills_radar"]
        }

        prompt = f"""
        Bạn là chuyên gia nhân sự AI. Hãy phân tích độ khớp giữa:
        Kỹ năng ứng viên: {cv_text}
        Yêu cầu công việc (JD): {jd_text}
        
        Viết 2-3 câu nhận xét tiếng Việt về ưu/nhược điểm cho phần ai_summary.
        Đánh giá điểm từ 0-100 cho các tiêu chí trong skills_radar.
        """
        
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=response_schema # Ép kiểu dữ liệu
                )
            )
            
            # Lấy dữ liệu đã parse sẵn
            ai_analysis = response.parsed
            
        except Exception as e:
            print(f"Lỗi khi gọi Gemini: {e}")
            # Dự phòng nếu AI lỗi
            ai_analysis = {
                "ai_summary": "Không thể tạo tóm tắt lúc này.",
                "skills_radar": {"Technical": 0, "Experience": 0, "Soft Skills": 0, "Education": 0, "Overall": 0}
            }
        
        # Hợp nhất kết quả khớp với Database Backend
        return {
            "ai_matching_score": final_score,
            "ai_summary": ai_analysis.get("ai_summary") if isinstance(ai_analysis, dict) else ai_analysis.ai_summary,
            "skills_radar": ai_analysis.get("skills_radar") if isinstance(ai_analysis, dict) else ai_analysis.skills_radar
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