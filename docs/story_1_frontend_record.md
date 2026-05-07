# story_1_frontend_record.md

## Title: Frontend - Interview Recording & Submission UI

**User Story:** Là một Candidate, tôi muốn trả lời các câu hỏi phỏng vấn sơ loại qua video sau khi nộp CV thành công, để có cơ hội thể hiện kỹ năng giao tiếp, thái độ và sự chuyên nghiệp.

**Acceptance Criteria (Tiêu chí nghiệm thu):**
* **Scenario 1: Hiển thị Popup và Xin quyền (CẬP NHẬT)**
  * **Given (Cho trước)** ứng viên vừa submit CV thành công.
  * **When (Khi)** hệ thống hiển thị popup thông báo phỏng vấn AI.
  * **Then (Thì)** trên popup phải có dòng lưu ý: *"Hệ thống AI sẽ đánh giá cả kỹ năng giao tiếp, biểu cảm khuôn mặt và môi trường xung quanh. Vui lòng đảm bảo ánh sáng tốt và nhìn thẳng vào camera"*.
  * **And (Và)** khi nhấn "Accept", trình duyệt yêu cầu quyền truy cập **CẢ Microphone VÀ Camera (Bắt buộc)**. Nếu user từ chối Camera, không cho phép tiếp tục.
* **Scenario 2: Quá trình Record**
  * **Given (Cho trước)** quyền thiết bị đã được cấp.
  * **When (Khi)** ứng viên tiến hành trả lời các câu hỏi.
  * **Then (Thì)** hệ thống sử dụng `MediaRecorder API` để ghi lại video/audio liên tục với định dạng `webm`.
  * **And (Và)** có đồng hồ đếm ngược tối đa 3 phút.
* **Scenario 3: Upload dữ liệu**
  * **Given (Cho trước)** ứng viên hoàn thành record.
  * **When (Khi)** nhấn "Submit Interview".
  * **Then (Thì)** file được upload lên server (size ≤ 25MB).

**Dev Notes (Ghi chú kỹ thuật):**
* **Media Constraints:** `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`. Phải handle lỗi `NotAllowedError` nếu user chặn camera và hiển thị thông báo yêu cầu mở camera để tiếp tục.

**Tasks:**
- [ ] UI/UX: Cập nhật Popup thông báo, bổ sung text lưu ý về việc AI đánh giá biểu cảm và môi trường.
- [ ] Xin quyền thiết bị: Fix cứng yêu cầu bắt buộc phải có Camera.
- [ ] Implement hook quản lý `MediaRecorder`.
- [ ] Tích hợp API lấy câu hỏi và API upload file.