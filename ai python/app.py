from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_text_from_pdf, ai_resume_parser
from models import MatchingEngine, InterviewEvaluator
import os
import uvicorn
import sys
import json
import uuid

# Cấu hình encoding UTF-8 cho stdout để tránh lỗi khi print tiếng Việt trên môi trường không hỗ trợ (như Windows Console cũ hoặc Docker logs)
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

app = FastAPI(title="Recruitment AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = MatchingEngine()
video_evaluator = InterviewEvaluator()

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...), jd_text: str = Form(...)):
    """
    Endpoint nhận file PDF và JD, trả về kết quả phân tích AI hoàn chỉnh.
    """
    temp_path = f"temp_{file.filename}"
    try:
        # Lưu file tạm để xử lý
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Chạy Task 1 & Task 2
        raw_text = extract_text_from_pdf(temp_path)
        cv_data = ai_resume_parser(raw_text)
        
        if not cv_data:
            raise ValueError("AI Resume Parser returned no data. Check API keys or model availability.")
        
        matching_result = engine.calculate_match(cv_data, jd_text)
        
        # Xóa file tạm sau khi xong
        os.remove(temp_path)
        
        # Trả về định dạng JSON mà chúng ta đã Mapping với Backend
        return {
            "candidate_data": cv_data,
            "matching_data": matching_result
        }
    except Exception as e:
        if os.path.exists(temp_path): os.remove(temp_path)
        print(f"Lỗi hệ thống khi xử lý CV: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-interview")
async def analyze_interview(file: UploadFile = File(...), context: str = Form(...)):
    """
    Endpoint nhận file Video (webm/mp4) và ngữ cảnh (JD, Questions), trả về kết quả đánh giá Multimodal.
    """
    # Lấy extension của file gốc, mặc định là .webm nếu không có
    ext = os.path.splitext(file.filename)[1] if file.filename else ".webm"
    if not ext: ext = ".webm"
    
    # Tạo tên file tạm thời an toàn (chỉ chứa ASCII) bằng UUID
    temp_path = f"temp_video_{uuid.uuid4().hex}{ext}"
    try:
        # Parse context JSON
        try:
            context_data = json.loads(context)
        except json.JSONDecodeError:
            return {"error": "Invalid JSON format in 'context' field."}

        # Lưu file video tạm
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
            
        print(f"Đã lưu video tạm: {temp_path}")
        
        # Chạy đánh giá video (Task Multimodal)
        evaluation_result = video_evaluator.evaluate_video(video_path=temp_path, context=context_data)
        
        return evaluation_result
        
    except Exception as e:
        print(f"Lỗi hệ thống khi xử lý video: {e}")
        # Trả về mã 500 để Node.js Backend biết là có lỗi
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Xóa file video tạm
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"Đã dọn dẹp file video local: {temp_path}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)