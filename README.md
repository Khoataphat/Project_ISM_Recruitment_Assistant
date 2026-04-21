# AI Matching Service (ISM Project)

Module AI trích xuất thông tin CV và tính điểm phù hợp (Matching Score) giữa ứng viên với công việc.

## 1. Cài đặt thư viện

Mở Terminal tại thư mục này và chạy lệnh:

```bash
pip install -r requirements.txt
```

*Lưu ý: Nếu bị lỗi quyền truy cập, hãy chạy Terminal với quyền Administrator.*

## 2. Cấu hình API Key

Tạo file `.env` cùng cấp với file `app.py` và dán nội dung sau vào (trong gg docs):

```env
GEMINI_API_KEY=AIzaSy... (Key lấy từ Google AI Studio)
HF_TOKEN=hf_... (Token lấy từ HuggingFace)
```

## 3. Cách chạy

Để bật Server cho nhóm Backend Node.js kết nối:

```bash
python app.py
```

  * **Địa chỉ API:** `http://localhost:8000/analyze-cv`
  * **Tài liệu hướng dẫn (Swagger):** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs) (Vào đây để test thử file PDF trực tiếp).