import requests
import json
import os

# 1. Tạo một file webm rỗng (fake) để test
fake_video_path = "test_video.webm"
with open(fake_video_path, "wb") as f:
    f.write(b"fake video content")

url = "http://localhost:8000/analyze-interview"

# 2. Chuẩn bị payload
context_data = {
    "job_description": "Tuyển dụng nhân viên Sale online. Yêu cầu tự tin, giao tiếp tốt, vui vẻ.",
    "questions": "Bạn có thể giới thiệu về bản thân và kinh nghiệm sale của bạn không?"
}

payload = {
    "context": json.dumps(context_data)
}

# Gửi multipart/form-data
print(f"Đang gửi request tới {url}...")
try:
    with open(fake_video_path, "rb") as video_file:
        files = {
            "video": ("test_video.webm", video_file, "video/webm")
        }
        
        # Lưu ý: Do file là fake nên Gemini có thể sẽ báo lỗi khi xử lý (thất bại ở state PROCESSING).
        # Đoạn script này chỉ để đảm bảo kết nối API, truyền nhận file hoạt động đúng schema.
        response = requests.post(url, data=payload, files=files)
        
        print("\n--- KẾT QUẢ TỪ SERVER ---")
        print("Status Code:", response.status_code)
        
        try:
            print("Response JSON:", json.dumps(response.json(), indent=4, ensure_ascii=False))
        except:
            print("Response Text:", response.text)

except Exception as e:
    print("Lỗi khi gọi API:", e)
finally:
    # Cleanup file fake
    if os.path.exists(fake_video_path):
        os.remove(fake_video_path)
