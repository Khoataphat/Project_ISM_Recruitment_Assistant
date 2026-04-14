# main.py
import json
from parser import extract_text_from_pdf, ai_resume_parser
from models import MatchingEngine 
def main():
    # --- CẤU HÌNH ĐẦU VÀO ---
    file_path = "TruongThaiNgocToan_Resume.pdf"
    
    # Giả sử đây là JD lấy từ bảng 'jobs' trong Database của Backend
    job_description = """
    Tuyển Lập trình viên Python. Yêu cầu biết sử dụng thư viện xử lý dữ liệu,
    có kiến thức về SQL và kỹ năng giao tiếp tiếng Anh cơ bản.
    Ưu tiên ứng viên biết về Machine Learning.
    """
    
    # --- BƯỚC 1: TRÍCH XUẤT CV (TASK 1) ---
    print(f"--- B1: Đang đọc và phân tích CV: {file_path} ---")
    raw_text = extract_text_from_pdf(file_path)
    cv_data = ai_resume_parser(raw_text)
    
    if not cv_data:
        print("Lỗi: Không thể trích xuất dữ liệu từ CV.")
        return

    # --- BƯỚC 2: TÍNH TOÁN MATCHING (TASK 2) ---
    print("--- B2: Đang so khớp với yêu cầu công việc (AI Matching) ---")
    engine = MatchingEngine()
    
    # Lấy danh sách kỹ năng từ Task 1 để đưa vào Task 2
    skills_list = cv_data.get("skills", [])
    
    # Gọi hàm calculate_match đã nâng cấp (có Summary và Radar)
    matching_result = engine.calculate_match(skills_list, job_description)

    # --- BƯỚC 3: TỔNG HỢP DỮ LIỆU ĐỂ BÀN GIAO CHO BACKEND ---
    final_output = {
        "candidate_data": cv_data, # Dữ liệu cho bảng candidates, education, experiences
        "matching_data": matching_result # Dữ liệu cho bảng applications (score, summary, radar)
    }

    print("\n" + "="*50)
    print("KẾT QUẢ CUỐI CÙNG SẴN SÀNG CHO BACKEND")
    print("="*50)
    print(json.dumps(final_output, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()