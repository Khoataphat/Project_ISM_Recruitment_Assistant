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
    Endpoint nháº­n file PDF vÃ  JD, tráº£ vá» káº¿t quáº£ phÃ¢n tÃ­ch AI hoÃ n chá»‰nh.
    """
    temp_path = f"temp_{file.filename}"
    try:
        # LÆ°u file táº¡m Ä‘á»ƒ xá»­ lÃ½
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Cháº¡y Task 1 & Task 2
        raw_text = extract_text_from_pdf(temp_path)
        cv_data = ai_resume_parser(raw_text)
        
        skills_list = cv_data.get("skills", [])
        matching_result = engine.calculate_match(skills_list, jd_text)
        
        # XÃ³a file táº¡m sau khi xong
        os.remove(temp_path)
        
        # Tráº£ vá» Ä‘á»‹nh dáº¡ng JSON mÃ  chÃºng ta Ä‘Ã£ Mapping vá»›i Backend
        return {
            "candidate_data": cv_data,
            "matching_data": matching_result
        }
    except Exception as e:
        if os.path.exists(temp_path): os.remove(temp_path)
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
