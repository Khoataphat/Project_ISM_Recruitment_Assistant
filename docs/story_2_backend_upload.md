# story_2_backend_upload.md

## Title: Backend - Receive Interview Upload & Async Trigger

**User Story:** Là một Hệ thống Backend, tôi muốn nhận, lưu trữ file video an toàn và kích hoạt AI Service ở background, để đảm bảo Frontend nhận được phản hồi nhanh chóng mà không bị timeout.

**Acceptance Criteria (Tiêu chí nghiệm thu):**
* **Scenario 1: Nhận và lưu trữ file**
  * **Given (Cho trước)** một request chứa file video upload từ Frontend.
  * **When (Khi)** server nhận được `multipart/form-data`.
  * **Then (Thì)** file được lưu thành công vào đường dẫn `/uploads/interviews/{applicationId}.webm`.
* **Scenario 2: Khởi tạo dữ liệu và Trả response nhanh**
  * **Given (Cho trước)** file đã được lưu vào disk.
  * **When (Khi)** hệ thống tạo record vào Database.
  * **Then (Thì)** record được tạo trong bảng `interviews` với status là `PROCESSING`.
  * **And (Và)** API trả về response `{ "status": "PROCESSING" }` cho Frontend dưới 2 giây.
* **Scenario 3: Xử lý Async**
  * **Given (Cho trước)** response đã được trả về cho Frontend.
  * **When (Khi)** luồng code tiếp tục chạy.
  * **Then (Thì)** kích hoạt một background job (hoặc `setImmediate`) để call sang API của AI Service với payload chứa file path và questions.

**Dev Notes (Ghi chú kỹ thuật):**
* **Endpoint:** POST `/ai-interview/submit`
* **Tech Stack:** Node.js, Express, Middleware `multer` (cấu hình disk storage).
* **Database:** Insert vào bảng `interviews` (id, applicationId, videoUrl, status: "PROCESSING").
* **Async Processing:** Để tiết kiệm thời gian setup cho project, dùng Option 1: `setImmediate` hoặc non-blocking Promise để trigger internal API của AI Service (POST `http://ai-service:8000/analyze-interview`). Không dùng await cho luồng này trên request chính.

**Tasks:**
- [ ] Setup `multer` config để handle multipart file, validation đuôi `.webm` và size limit (25MB).
- [ ] Implement logic POST `/ai-interview/submit`.
- [ ] Tạo query/ORM insert record vào bảng `interviews` (status: `PROCESSING`).
- [ ] Viết function trigger async call sang `ai-service` (đính kèm file stream và JSON questions).