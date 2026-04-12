# main.py
from parser import extract_text_from_pdf, ai_resume_parser
import json

def main():
    # 1. Tên file PDF bạn vừa bỏ vào thư mục
    file_path = "HÀ ANH KHOA_ CV INTERN.pdf" 
    
    print(f"--- Bước 1: Đang đọc nội dung từ file {file_path} ---")
    raw_text = extract_text_from_pdf(file_path)
    
    if not raw_text:
        print("Lỗi: Không thể đọc được nội dung PDF. Hãy kiểm tra lại file.")
        return

    print("--- Bước 2: Đang gửi dữ liệu sang Gemini AI để phân tích ---")
    try:
        # Gọi hàm xử lý từ file parser.py
        result = ai_resume_parser(raw_text)
        
        print("\n--- KẾT QUẢ TRÍCH XUẤT (JSON) ---")
        # In kết quả định dạng đẹp (indent=4) để kiểm tra
        print(json.dumps(result, indent=4, ensure_ascii=False))
        
        print("\n=> Chúc mừng! Task 1 đã hoàn thành thành công.")
        
    except Exception as e:
        print(f"Lỗi phát sinh khi AI xử lý: {e}")

if __name__ == "__main__":
    main()