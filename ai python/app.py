from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from parser import extract_text_from_pdf, ai_resume_parser
from models import MatchingEngine
import os
import uvicorn

app = FastAPI(title="Recruitment AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = MatchingEngine()

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
        
        skills_list = cv_data.get("skills", [])
        matching_result = engine.calculate_match(skills_list, jd_text)
        
        # Xóa file tạm sau khi xong
        os.remove(temp_path)
        
        # Trả về định dạng JSON mà chúng ta đã Mapping với Backend
        return {
            "candidate_data": cv_data,
            "matching_data": matching_result
        }
    except Exception as e:
        if os.path.exists(temp_path): os.remove(temp_path)
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)