# Product Feature Document - Recruitment Assistant

Tài liệu này tổng hợp các tính năng đã hoàn thiện, danh mục API và các đánh giá về mặt sản phẩm từ góc độ Product Manager.

## 1. Danh sách tính năng đã hoàn thiện (Ready for Production)

### 🔐 Hệ thống Xác thực & Phân quyền (Auth & Security)
- **Đăng ký/Đăng nhập**: Hỗ trợ đầy đủ luồng đăng ký tài khoản mới và đăng nhập bằng JWT.
- **Xác thực Email**: Tính năng gửi mã xác thực và kiểm tra email trước khi kích hoạt tài khoản.
- **Phân quyền Role-based**: Phân biệt rõ rệt giữa **Candidate** (Ứng viên) và **HR** (Nhà tuyển dụng).
- **Refresh Token**: Duy trì phiên đăng nhập bảo mật và linh hoạt.

### 💼 Quản lý Tin tuyển dụng (Job Management)
- **Công bố Job (Public)**: Ứng viên có thể xem danh sách các vị trí đang tuyển và chi tiết từng công việc.
- **Quản trị Job (HR)**: Nhà tuyển dụng có quyền Tạo mới, Cập nhật và Quản lý danh sách các tin tuyển dụng của mình.

### 📄 Luồng Ứng tuyển & Quản lý hồ sơ (Application Pipeline)
- **Upload CV thông minh**: Hỗ trợ tải lên file PDF với dung lượng tối đa 5MB.
- **Theo dõi hồ sơ**: Ứng viên xem được danh sách các công việc đã ứng tuyển và trạng thái xử lý hồ sơ.
- **Quản lý ứng viên (Dashboard)**: HR có bảng điều khiển tập trung để quản lý toàn bộ hồ sơ ứng tuyển, thay đổi trạng thái (Shortlisted, Rejected, Interviewing).

### 🤖 AI Recruitment Assistant (Core Automation)
- **Extract Text**: Tự động trích xuất nội dung từ PDF CV.
- **CV Parsing**: Tự động bóc tách thông tin cá nhân, kỹ năng, kinh nghiệm từ CV thô sang dữ liệu cấu trúc.
- **Smart Matching**: So khớp tự động giữa CV và JD để đưa ra điểm số (Matching Score).
- **Reasoning & Radar**: Giải thích lý do chấm điểm và cung cấp biểu đồ radar về các khía cạnh (Technical, Soft Skills, Experience...).

---

## 2. Danh sách API Endpoints hiện có

### Module: Authentication (`/auth`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| POST | `/auth/register` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập hệ thống |
| POST | `/auth/verify-email` | Xác thực tài khoản qua email |
| GET | `/auth/me` | Lấy thông tin cá nhân hiện tại |
| POST | `/auth/refresh-token` | Làm mới phiên làm việc |

### Module: Job (`/jobs`)
| Method | Endpoint | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| GET | `/jobs/` | Liệt kê tất cả Job công khai | Public |
| GET | `/jobs/:id` | Chi tiết một Job | Public |
| POST | `/jobs/` | Tạo tin tuyển dụng mới | HR |
| PATCH | `/jobs/:id` | Cập nhật thông tin Job | HR |
| GET | `/jobs/hr` | Danh sách Job do HR quản lý | HR |

### Module: Application (`/applications`)
| Method | Endpoint | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| POST | `/applications/` | Nộp CV ứng tuyển (Multipart) | Candidate |
| GET | `/applications/` | Danh sách Job đã ứng tuyển | Candidate |
| GET | `/applications/:id` | Chi tiết hồ sơ ứng tuyển | Candidate |

### Module: Dashboard (`/dashboard`)
| Method | Endpoint | Mô tả | Quyền |
| :--- | :--- | :--- | :--- |
| GET | `/dashboard/stats` | Thống kê số lượng Job, Apps... | HR |
| GET | `/dashboard/applications` | Xem toàn bộ hồ sơ ứng tuyển | HR |
| PATCH | `/dashboard/applications/:id/status` | Duyệt/Từ chối hồ sơ | HR |

### AI Service (Internal API - Port 8000)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| POST | `/analyze-cv` | Phân tích CV và so khớp với JD |

---

## 3. Giới hạn hiện tại & Điểm nghẽn (Product Bottlenecks)

1.  **Xử lý CV đồng bộ (Synchronous AI Call)**: Hiện tại Backend gọi AI Service và chờ kết quả để cập nhật Database. Nếu số lượng CV lớn, việc chờ LLM phản hồi (có thể mất 10-30s) sẽ làm tăng nguy cơ timeout và giảm trải nghiệm người dùng.
    *   *Đề xuất*: Chuyển sang mô hình Message Queue (Redis/RabbitMQ).
2.  **Lưu trữ File cục bộ**: CV đang được lưu tại thư mục `/uploads` trên Server. Điều này gây khó khăn cho việc scale hệ thống bằng Docker Swarm hoặc K8s.
    *   *Đề xuất*: Tích hợp Cloud Storage (AWS S3, Cloudinary).
3.  **Sự phụ thuộc vào API Gemini**: Việc phân tích hoàn toàn phụ thuộc vào Google Gemini. Nếu API này gặp lỗi hoặc vượt giới hạn (Rate Limit), luồng ứng tuyển sẽ bị gián đoạn (Status: Failed).
4.  **Thiếu tính năng Chỉnh sửa Profile**: Ứng viên hiện chỉ dựa vào việc upload CV để cập nhật thông tin. Cần bổ sung tính năng cho phép ứng viên tự chỉnh sửa kỹ năng/kinh nghiệm thủ công.
5.  **Bảo mật Dashboard**: Các route dashboard đã có middleware nhưng cần bổ sung thêm log giám sát để vết lại các hành động thay đổi trạng thái hồ sơ của HR.
