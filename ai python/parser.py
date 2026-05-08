import os
import fitz  # PyMuPDF
import json
from google import genai
from dotenv import load_dotenv

# Load API Key từ file .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

# Dòng này để debug, nếu nó hiện "None" nghĩa là file .env chưa được load đúng
print(f"DEBUG: API Key tìm thấy: {api_key[:10]}..." if api_key else "DEBUG: KHÔNG tìm thấy API Key!")

if not api_key:
    raise ValueError("Lỗi: Không tìm thấy GEMINI_API_KEY trong file .env")

client = genai.Client(api_key=api_key)

def extract_text_from_pdf(pdf_path):
    """Trích xuất văn bản thô từ file PDF"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Lỗi khi đọc file PDF: {e}")
        return None

def ai_resume_parser(cv_text):
    
    # Định nghĩa cấu trúc dữ liệu mong muốn (giúp AI làm việc chính xác hơn)
    prompt = f"""
    Bạn là một chuyên gia nhân sự AI. Hãy phân tích văn bản CV dưới đây và trích xuất thông tin
    chính xác dưới định dạng JSON.
    Lưu ý:
    - Nếu thông tin không có, để là null.
    - Phần 'skills' hãy tách thành danh sách các từ khóa cụ thể.
    - Phần 'years_of_experience' hãy trả về một con số (int).


    Định dạng JSON yêu cầu:
    {{
      "full_name": "string",
      "email": "string",
      "phone": "string. Ví dụ: 'Sinh viên năm 3 - Đại học Quốc tế'. Nếu chưa tốt nghiệp, KHÔNG ĐƯỢC ghi là 'Cử nhân'.",
      "education": "string",
      "years_of_experience": int,
      "skills": ["skill1", "skill2", ...],
      "summary": "Tóm tắt ngắn gọn 1 câu về ứng viên"
    }}


    Văn bản CV:
    {cv_text}
    """

    import time
    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                }
            )
            return json.loads(response.text)
        except Exception as e:
            if attempt < max_retries - 1 and ("503" in str(e) or "429" in str(e)):
                print(f"Lỗi Gemini ({e}), đang thử lại lần {attempt + 1}...")
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                print(f"Lỗi parser: {e}")
                return None
    return None