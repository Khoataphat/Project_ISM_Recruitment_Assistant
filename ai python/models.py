import json
import os
import sys

# Cấu hình encoding UTF-8 cho stdout
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
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

    def calculate_match(self, cv_data, jd_text):
        # 1. Tính điểm Cosine Similarity (Toán học - Tham khảo)
        cv_skills = cv_data.get("skills", [])
        cv_text = ", ".join(cv_skills)
        embeddings = self.model.encode([cv_text, jd_text], convert_to_tensor=True)
        score = util.cos_sim(embeddings[0], embeddings[1])
        math_score = round(float(score[0][0]) * 100, 2)

        # 2. Định nghĩa Schema cho AI trả về
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "final_match_score": {"type": "INTEGER"}, # Điểm tổng kết cuối cùng (0-100)
                "ai_summary": {"type": "STRING"}, # Tóm tắt 2-3 câu
                "skill_gaps": { # Các kỹ năng/yêu cầu ứng viên còn thiếu
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "ai_explanation": {
                    "type": "OBJECT",
                    "properties": {
                        "score_reason": {"type": "STRING"}, # Giải thích tại sao lại cho điểm số đó (Reasoning)
                        "radar_breakdown": {"type": "STRING"} # Giải thích các khía cạnh trong radar
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
            "required": ["final_match_score", "ai_summary", "skill_gaps", "ai_explanation", "skills_radar"]
        }

        # 3. Prompt tinh chỉnh (Task 2 & 3)
        prompt = f"""
        Bạn là Chuyên gia Tuyển dụng AI cao cấp. Nhiệm vụ của bạn là đánh giá sự phù hợp của ứng viên đối với Job Description (JD).

        THÔNG TIN ỨNG VIÊN:
        - Tóm tắt: {cv_data.get('summary')}
        - Kỹ năng: {cv_text}
        - Năm kinh nghiệm: {cv_data.get('years_of_experience')}
        - Học vấn: {cv_data.get('education')}

        YÊU CẦU CÔNG VIỆC (JD):
        {jd_text}

        THAM CHIẾU TOÁN HỌC:
        - Điểm tương đồng từ khóa (Cosine Similarity): {math_score}%

        YÊU CẦU:
        1. Phân tích sâu: Đừng chỉ nhìn vào từ khóa, hãy đánh giá cả chiều sâu kinh nghiệm và học vấn.
        2. Điểm số 'final_match_score' (0-100): Phải là con số thực tế phản ánh độ khớp.
        3. 'ai_summary': Tóm tắt điểm mạnh/yếu của ứng viên (2-3 câu).
        4. 'skill_gaps': Liệt kê cụ thể các kỹ năng hoặc yêu cầu trong JD mà ứng viên ĐANG THIẾU.
        5. 'score_reason': Giải thích chi tiết tại sao lại cho điểm 'final_match_score' (Đây là phần reasoning).
        6. 'skills_radar': Chấm điểm từ 0-100 cho: Technical, Experience, Soft Skills, Education, Overall.
        7. 'radar_breakdown': Giải thích logic cho các con số trong radar.
        """
        
        import time
        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
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
                break
            except Exception as e:
                if attempt < max_retries - 1 and ("503" in str(e) or "429" in str(e)):
                    print(f"Lỗi Gemini ({e}), đang thử lại lần {attempt + 1}...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    print(f"Lỗi khi gọi Gemini: {e}")
                    ai_analysis = {
                        "final_match_score": math_score,
                        "ai_summary": "Không thể tạo tóm tắt.",
                        "skill_gaps": [],
                        "ai_explanation": {
                            "score_reason": f"Lỗi AI. Sử dụng điểm toán học tạm thời: {math_score}%",
                            "radar_breakdown": "Không có dữ liệu."
                        },
                        "skills_radar": {
                            "Technical": 0, "Experience": 0, "Soft Skills": 0, "Education": 0, "Overall": 0
                        }
                    }
                    break
        
        def get_val(obj, key):
            if isinstance(obj, dict):
                return obj.get(key)
            return getattr(obj, key, None)

        final_score = get_val(ai_analysis, "final_match_score")
        if final_score is None: final_score = math_score

        print(f"[AI Engine] Final Score: {final_score}%")

        return {
            # Nhiệm vụ 3: Cấu trúc mới
            "matching_score": final_score,
            "reasoning": get_val(get_val(ai_analysis, "ai_explanation"), "score_reason"),
            "skill_gaps": get_val(ai_analysis, "skill_gaps"),
            
            # Giữ lại các key cũ cho tương thích với Backend hiện tại
            "ai_matching_score": final_score,
            "ai_summary": get_val(ai_analysis, "ai_summary"),
            "skills_radar": get_val(ai_analysis, "skills_radar"),
            "ai_explanation": get_val(ai_analysis, "ai_explanation")
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