# 🎓 ExLMS - Excellent Learning Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-orange.svg)](https://livekit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ExLMS** là một hệ thống quản lý học tập (LMS) hiện đại, tập trung vào trải nghiệm học tập cộng tác thời gian thực. Hệ thống cung cấp đầy đủ các công cụ cho giảng viên và sinh viên từ quản lý khóa học, bài tập, đến các buổi học trực tuyến và soạn thảo văn bản đồng thời.
Giao diện thân thiện với 2 theme sáng hoặc tối, hệ thống ngôn ngữ Vi/En hỗ trợ song ngữ.

<img width="1920" height="1080" alt="Screenshot 2026-04-19 202558" src="https://github.com/user-attachments/assets/a1717dc0-76f6-4fc8-9a9e-522bff8659c3" />

---

## ✨ Tính năng nổi bật

### 📚 Quản lý đào tạo

- **Khóa học & Bài học**: Quản lý nội dung học tập theo chương hồi, hỗ trợ video, văn bản và các tài nguyên đính kèm.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 210353" src="https://github.com/user-attachments/assets/942bdde5-d2f8-4f44-9016-c3fef8f164ec" />
---
- **Quản lý nhóm (Groups)**: Tạo và tham gia các nhóm học tập chuyên biệt, quản lý thành viên và quyền hạn.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 212750" src="https://github.com/user-attachments/assets/1e32d99f-62e9-4203-9e71-8b301768b62d" />
---
### 🎥 Cộng tác thời gian thực

- **Lớp học trực tuyến (Meeting)**: Tích hợp LiveKit cho phép hội thoại video chất lượng cao, chia sẻ màn hình, đặt câu hỏi và bình chọn (polls) ngay trong buổi học.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 214037" src="https://github.com/user-attachments/assets/d638fde6-69d1-4edc-82be-ba42a7eebc70" />
---
- **Soạn thảo đồng thời (Collab)**: Soạn thảo văn bản Real-time (tương tự Google Docs) dựa trên công nghệ Hocuspocus và Tiptap.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 203301" src="https://github.com/user-attachments/assets/db9d1cf2-b0c7-4b95-b661-9a65a8556746" />
---
### 📝 Kiểm tra & Đánh giá
- **Hệ thống Bài tập (Assignments)**: Giao bài, nộp bài đa phương thức và chấm điểm trực tuyến.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 214641" src="https://github.com/user-attachments/assets/cf39abfd-cd0d-4992-a397-5c7844122276" />
---
<img width="1920" height="1080" alt="Screenshot 2026-04-19 210041" src="https://github.com/user-attachments/assets/c2f3b484-a474-4418-85d0-6204c875443b" />
---
- **Trắc nghiệm (Quizzes)**: Tạo ngân hàng câu hỏi, thiết lập thời gian làm bài và tự động chấm điểm.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 210419" src="https://github.com/user-attachments/assets/ebef487f-481b-4d40-824f-1779baadc8e9" />
---
<img width="1920" height="1080" alt="Screenshot 2026-04-19 210213" src="https://github.com/user-attachments/assets/3602633c-3779-44c0-96d5-42423bc46d9d" />
---
### 💬 Tương tác & Thông báo
- **Diễn đàn (Forum)**: Nơi trao đổi kiến thức, thảo luận giữa các thành viên.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 205431" src="https://github.com/user-attachments/assets/4b7ed2a7-6b31-4a3b-a007-4a4c8347c706" />
---
- **Lịch biểu (Calendar)**: Cập nhật các hoạt động mới nhất trong nhóm học tập.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 210449" src="https://github.com/user-attachments/assets/67986505-1c3f-4844-a78f-7563ac646d89" />
---
<img width="1920" height="1080" alt="Screenshot 2026-04-19 210456" src="https://github.com/user-attachments/assets/e8289aee-90f8-41b2-92be-5ccb03fa5ebb" />
---
- **Thông báo đa nền tảng**: Nhận thông báo tức thời qua WebSocket (Toast) và Email.
<img width="1920" height="1080" alt="Screenshot 2026-04-19 210430" src="https://github.com/user-attachments/assets/9ea8ec04-8287-421c-ae72-a11813d06a30" />
---

## 🛠 Công nghệ sử dụng

### Backend (Core)
- **Framework**: Spring Boot 3.x, Spring Security, Spring Data JPA.
- **Database**: MySQL 8.4 (Lưu trữ dữ liệu), Redis (Caching & Shared State).
- **Storage**: MinIO (Object Storage tương thích S3) để lưu trữ file tài liệu và ảnh.
- **Real-time**: WebSocket (STOMP), JavaMailSender.

### Services
- **Meeting Service**: Node.js service điều phối kết nối và Token cho LiveKit.
- **Collab Service**: Hocuspocus server (Node.js) xử lý đồng bộ hóa văn bản Yjs.
- **Media Server**: LiveKit Server (WebRTC SFU).

### Frontend
- **Core**: React 18, Vite, Redux Toolkit.
- **UI/UX**: Material UI (MUI), Framer Motion (Animations), CKEditor 5.
- **Communication**: Axios, STOMPjs, LiveKit SDK.

---

## 🚀 Hướng dẫn cài đặt nhanh

Hệ thống được thiết kế để triển khai dễ dàng thông qua Docker Compose.

### 1. Chuẩn bị
- Đã cài đặt [Docker](https://www.docker.com/) và [Docker Compose](https://docs.docker.com/compose/).
- Đã có tài khoản Google Cloud để lấy `Client ID` & `Client Secret` (nếu dùng Login Google).

### 2. Cấu hình môi trường

Hệ thống sử dụng các biến môi trường để cấu hình linh hoạt. Bạn cần tạo file `.env` dựa trên file mẫu:

```bash
cp .env.example .env
```

Sau đó, hãy mở file `.env` và cập nhật các thông số quan trọng như:
*   **Database**: URL, username và password của MySQL.
*   **Security**: `JWT_SECRET_KEY` (chuỗi bảo mật cho token).
*   **MinIO**: Thông tin đăng nhập storage.
*   **Google OAuth**: Client ID & Secret để đăng nhập bằng Google.
*   **Mail**: Cấu hình SMTP (Gmail App Password) để gửi thông báo.
*   **LiveKit**: API Key/Secret và Public IP cho hội thoại trực tuyến.

> [!IMPORTANT]
> Tuyệt đối không chia sẻ file `.env` thực tế của bạn lên các kho mã nguồn công khai (GitHub/GitLab). File này đã được đưa vào `.gitignore`.

### 3. Khởi chạy hệ thống
Chạy lệnh sau để Docker tự động Build và khởi động tất cả các dịch vụ:
```bash
docker compose up -d --build
```

Hệ thống sẽ khả dụng tại:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8081](http://localhost:8081)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001)

---

## 📂 Cấu trúc dự án
```text
📦 ExLMS
 ┣ 📂 ExLMS-BE          # Source code Spring Boot (Backend chính)
 ┣ 📂 ExLMS-FE          # Source code React (Frontend)
 ┣ 📂 ExLMS-Meeting     # Microservice quản lý phòng họp (Node.js)
 ┣ 📂 ExLMS-Collab      # Microservice soạn thảo đồng thời (Node.js)
 ┣ 📂 Assets            # Tài nguyên hình ảnh, biểu tượng hệ thống
 ┣ 📜 docker-compose.yml # File cấu hình triển khai toàn hệ thống
 ┗ 📜 README.md         # Tài liệu hướng dẫn
```

---

## 👥 Tác giả
Dự án được phát triển bởi **TeamFive (ExLMS Team)**. 
- GitHub: [@mingfang914](https://github.com/mingfang914)

---

## 📄 Giấy phép
Hệ thống được phát hành dưới giấy phép **MIT License**. Vui lòng xem file `LICENSE` để biết thêm chi tiết.
