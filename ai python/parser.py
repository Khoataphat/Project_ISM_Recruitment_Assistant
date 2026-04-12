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
    """Sử dụng Gemini 1.5 Flash để trích xuất dữ liệu sang JSON"""
    
    # Định nghĩa cấu trúc dữ liệu mong muốn (giúp AI làm việc chính xác hơn)
    prompt = f"""
    Bạn là một chuyên gia nhân sự AI. Hãy phân tích CV dưới đây và trả về dữ liệu JSON.
    Yêu cầu:
    - 'skills': Chỉ liệt kê các từ khóa kỹ thuật (Tech stack).
    - 'years_of_experience': Trả về một số nguyên (int).
    - 'summary': Tóm tắt ngắn gọn năng lực ứng viên trong 1 câu.

    Nội dung CV:
    {cv_text}
    """

    try:
        # Cách gọi model mới của SDK google-genai
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
            }
        )
        
        # Parse chuỗi JSON trả về thành Dictionary trong Python
        return json.loads(response.text)
    except Exception as e:
        print(f"Lỗi: {e}")
        return None