from sentence_transformers import SentenceTransformer, util
import torch

class MatchingEngine:
    def __init__(self):
        print("--- Đang khởi tạo bộ não AI (Task 2)... ---")
        # Load model vào RAM. Chỉ tốn thời gian lần đầu tiên.
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("--- AI đã sẵn sàng! ---")

    def calculate_score(self, cv_skills, jd_text):
        """
        cv_skills: list ["Java", "SQL", "React"]
        jd_text: string "Tuyển lập trình viên biết Java và cơ sở dữ liệu..."
        """
        # 1. Chuẩn bị văn bản
        cv_text = ", ".join(cv_skills)
        
        # 2. Chuyển đổi sang Vector
        embeddings = self.model.encode([cv_text, jd_text], convert_to_tensor=True)
        
        # 3. Tính toán độ tương đồng Cosine
        # embeddings[0] là CV, embeddings[1] là JD
        score = util.cos_sim(embeddings[0], embeddings[1])
        
        # Chuyển từ tensor sang số float và làm tròn
        final_score = float(score[0][0]) * 100
        return round(final_score, 2)

# --- CHẠY THỬ NGHIỆM ---
if __name__ == "__main__":
    engine = MatchingEngine()
    
    # Giả sử đây là dữ liệu từ Task 1
    my_skills = ["Java", "Python", "SQL Server", "Machine Learning"]
    
    # Giả sử đây là JD từ nhà tuyển dụng
    job_desc = "Cần tuyển thực tập sinh biết lập trình Python, có kiến thức về dữ liệu và SQL."
    
    result = engine.calculate_score(my_skills, job_desc)
    print(f"\n=> Độ tương đồng: {result}%")