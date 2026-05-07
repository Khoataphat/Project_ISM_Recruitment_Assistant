# story_3_python_evaluate.md

## Title: AI Service - Multimodal Video Analysis using LLM

**User Story:** Là một AI Service, tôi muốn nhận trực tiếp file video và sử dụng năng lực đa phương thức (Multimodal) của LLM để phân tích đồng thời cả nội dung trả lời (giọng nói) lẫn biểu cảm (ánh mắt, thái độ) và môi trường xung quanh, để trả về một báo cáo đánh giá toàn diện nhất cho ứng viên.

**Acceptance Criteria (Tiêu chí nghiệm thu):**
* **Scenario 1: Tiếp nhận và xử lý Video**
  * **Given (Cho trước)** file video (`.webm`) được gửi từ Backend.
  * **When (Khi)** AI Service nhận được payload.
  * **Then (Thì)** hệ thống đóng gói trực tiếp video kèm Prompt (chứa JD, CV, Questions) để gửi lên API của Gemini.
* **Scenario 2: Multimodal Evaluation (Đánh giá đa chiều)**
  * **Given (Cho trước)** video và ngữ cảnh đã được gửi cho LLM.
  * **When (Khi)** LLM tiến hành phân tích.
  * **Then (Thì)** LLM phân tích được nội dung giọng nói (không cần STT ngoài) VÀ phân tích được hình ảnh (eye contact, sự tự tin qua ngôn ngữ cơ thể, tính chuyên nghiệp của môi trường xung quanh).
  * **And (Và)** trả về kết quả JSON đúng chuẩn schema bao gồm: `interview_score`, `communication_score`, `attitude_score` (điểm thái độ/biểu cảm mới), `environment_note` (đánh giá môi trường), và feedback chi tiết.
* **Scenario 3: Error Handling & Sync**
  * **Given (Cho trước)** quá trình gọi API diễn ra.
  * **When (Khi)** kết quả trả về thành công hoặc thất bại.
  * **Then (Thì)** nếu lỗi timeout hoặc rate limit, retry tối đa 1 lần.
  * **And (Và)** nếu thành công, update bảng `interviews` sang status `DONE` và update `applications`.

**Dev Notes (Ghi chú kỹ thuật):**
* **Endpoint:** POST `/analyze-interview` (FastAPI). Payload: multipart data (video file + context JSON).
* **AI Architecture:** Loại bỏ hoàn toàn Whisper/STT. Đẩy thẳng file video vào Gemini API (sử dụng File API của Gemini để upload video lên trước nếu file lớn, hoặc gửi direct buffer nếu API hỗ trợ dung lượng phù hợp).
* **Prompt Engineering:** Prompt cần chỉ định rõ: "Ngoài việc chấm điểm nội dung câu trả lời, hãy đóng vai trò là một chuyên gia nhân sự quan sát ngôn ngữ cơ thể, giao tiếp bằng mắt (eye contact), biểu cảm khuôn mặt và độ gọn gàng của môi trường xung quanh để đưa ra đánh giá".
* **Performance:** Timeout cần tăng lên (ví dụ: 180s) vì xử lý multimodal video sẽ mất thời gian hơn xử lý text.

**Tasks:**
- [ ] Init FastAPI endpoint `/analyze-interview`.
- [ ] Cấu hình Gemini SDK để hỗ trợ Multimodal input (Video + Text Prompt).
- [ ] Xây dựng Prompt mới chú trọng vào cả verbal (lời nói) và non-verbal (phi ngôn ngữ).
- [ ] Cập nhật schema JSON đầu ra để có thêm trường `attitude_score` và `environment_note`.
- [ ] Viết logic upload video lên Gemini File API (nếu cần thiết để bypass payload limit) và quản lý việc xóa file trên cloud sau khi phân tích xong.
- [ ] Implement logic update kết quả vào Database.