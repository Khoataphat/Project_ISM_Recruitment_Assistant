# Frontend Product Features - Recruitment Assistant

Tài liệu này mô tả trải nghiệm người dùng (UX) và các tính năng giao diện từ góc độ Product Manager, dựa trên cấu trúc Frontend hiện tại.

## 1. Luồng người dùng (User Flows) đã hoàn thiện

### Luồng Ứng tuyển (CV Upload Flow)
Đây là luồng quan trọng nhất của hệ thống:
1.  **Truy cập Job**: Ứng viên xem chi tiết công việc tại `CandidateJobDetailsPage`.
2.  **Kích hoạt Modal**: Click nút "Apply now" -> Mở `JobApplyModal` với hiệu ứng làm mờ nền (Backdrop blur).
3.  **Tương tác File**: 
    - Người dùng kéo thả hoặc chọn file PDF.
    - Hệ thống kiểm tra định dạng (.pdf) và dung lượng (< 5MB) ngay tại Client.
    - Nếu không hợp lệ: Hiển thị thông báo lỗi (Toast) ngay lập tức.
4.  **Xác nhận nộp đơn**: Click "Submit application" -> Nút chuyển sang trạng thái Loading, Modal khóa tương tác để tránh gửi trùng lặp.
5.  **Kết quả**:
    - **Thành công**: Modal tự đóng, hiển thị Toast "Success", ứng viên được điều hướng hoặc thông báo xem kết quả tại danh sách ứng tuyển.
    - **Thất bại**: Hiển thị Toast lỗi chi tiết từ Server.

### Luồng Duyệt hồ sơ (HR Review Flow)
1.  **Mở Dashboard**: HR xem danh sách ứng viên tại `HrDashboardPage`.
2.  **Xem chi tiết**: Click vào một ứng viên -> Chuyển sang `HrCandidateDetailsPage`.
3.  **Đánh giá AI**: Xem biểu đồ Progress (điểm số), Tóm tắt (Summary) và Radar Chart (kỹ năng) do AI cung cấp.
4.  **Chuyển trạng thái**: Chọn trạng thái mới (Shortlisted, Rejected...) từ `Select` box -> UI hiển thị trạng thái "Updating" và tự động cập nhật màu sắc Tag tương ứng.

---

## 2. Các UI State hiện có (UI Implementation)

| Trạng thái | Hình thức hiển thị | Ví dụ thực tế trong code |
| :--- | :--- | :--- |
| **Loading** | Component `Spin`, `loading` prop trên Button | Khi fetch danh sách Job, khi click Submit |
| **Error (Toàn trang)** | Component `Result` (404, 500) | Khi truy cập Job ID không tồn tại |
| **Error (Cục bộ)** | Component `Alert`, `message.error` | Thông báo lỗi upload, lỗi cập nhật status |
| **Success** | `message.success` (Toast) | Sau khi nộp CV thành công |
| **Empty State** | `Result` title "Not found" | Khi danh sách Job hoặc Ứng viên trống |

---

## 3. Điểm mù UX/UI (UX Gaps & Opportunities)

Dựa trên phân tích mã nguồn, dưới đây là các điểm có thể cải thiện để nâng cao trải nghiệm người dùng:

1.  **Thiếu Phản hồi Tiến trình AI (Real-time AI Status)**:
    - *Hiện trạng*: Sau khi nộp CV, ứng viên chỉ thấy "Thành công", nhưng quá trình AI phân tích diễn ra sau đó.
    - *Vấn đề*: Ứng viên có thể hoang mang không biết bao giờ có điểm số.
    - *Cải thiện*: Thêm thông báo "AI đang phân tích hồ sơ của bạn, kết quả sẽ có trong 10-30 giây".

2.  **Thanh tiến trình Upload (Upload Progress)**:
    - *Hiện trạng*: Chỉ có spinner trên nút Submit.
    - *Vấn đề*: Với file dung lượng lớn (4-5MB), người dùng không biết file đã upload được bao nhiêu %.
    - *Cải thiện*: Thêm thanh Progress Bar thực tế trong `JobApplyModal`.

3.  **Trải nghiệm Chờ (Perceived Performance)**:
    - *Hiện trạng*: Sử dụng `Spin` (vòng xoay) đơn giản.
    - *Vấn đề*: Tạo cảm giác chờ đợi lâu.
    - *Cải thiện*: Áp dụng **Skeleton Screens** cho các Card thông tin và biểu đồ Radar để giao diện cảm giác mượt mà hơn.

4.  **Xác nhận hành động quan trọng (Confirmation)**:
    - *Hiện trạng*: Khi HR nhấn "Rejected", trạng thái cập nhật ngay lập tức.
    - *Vấn đề*: Dễ nhấn nhầm gây ảnh hưởng đến ứng viên.
    - *Cải thiện*: Thêm Popconfirm (Xác nhận lại) cho các hành động mang tính quyết định như Từ chối hồ sơ.

5.  **Mobile Layout Optimization**:
    - *Hiện trạng*: Biểu đồ Radar và bảng điểm AI chiếm nhiều diện tích.
    - *Vấn đề*: Trên điện thoại có thể bị tràn hoặc khó quan sát.
    - *Cải thiện*: Tối ưu hóa layout xếp chồng (Stack) cho phần AI Analysis trên mobile.
