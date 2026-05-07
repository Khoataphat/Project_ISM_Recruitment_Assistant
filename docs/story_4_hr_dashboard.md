# story_4_hr_dashboard.md

## Title: HR Dashboard - AI Interview Result View

**User Story:** Là một HR Manager, tôi muốn xem kết quả phỏng vấn sơ loại do AI chấm bao gồm cả điểm nội dung, thái độ và đánh giá môi trường, để có cái nhìn toàn diện nhất về ứng viên.

**Acceptance Criteria (Tiêu chí nghiệm thu):**
* **Scenario 1: Lấy dữ liệu điểm số (CẬP NHẬT)**
  * **Given (Cho trước)** HR truy cập vào chi tiết hồ sơ ứng viên.
  * **When (Khi)** trang được load.
  * **Then (Thì)** hệ thống hiển thị điểm tổng quan và các chỉ số chi tiết bao gồm các dimension mới: `communication_score`, `confidence_score`, `relevance_score`, **và `attitude_score` (Điểm thái độ/biểu cảm)**.
* **Scenario 2: Hiển thị Feedback và Video (CẬP NHẬT)**
  * **Given (Cho trước)** ứng viên có status interview là `DONE`.
  * **When (Khi)** HR xem phần AI Analysis.
  * **Then (Thì)** hiển thị text nhận xét (Summary, Strengths, Weaknesses).
  * **And (Và)** hiển thị thêm mục **Environment Note (Đánh giá môi trường / tác phong)**.
  * **And (Và)** có tích hợp Video Player HTML5 để xem lại đoạn video.
* **Scenario 3: Bảo mật file**
  * (Không đổi: Chặn truy cập từ user không có quyền HR).

**Dev Notes (Ghi chú kỹ thuật):**
* **UI/UX Chart:** Component Radar Chart hiện tại cần được config lại để nhận 4-5 trục (thêm trục Thái độ/Biểu cảm) thay vì 3 trục như ban đầu.

**Tasks:**
- [x] (Backend) Viết API GET `/ai-interview/result/:applicationId`.
- [x] (Frontend) Cập nhật Radar Chart / Progress Bar để vẽ thêm `attitude_score`.
- [x] (Frontend) Thêm block UI để hiển thị `environment_note`.
- [x] (Frontend) Tạo khu vực hiển thị Summary, Strengths, Weaknesses và Video Player.