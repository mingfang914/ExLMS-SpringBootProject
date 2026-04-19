# 🎓 ExLMS - Excellent Learning Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-orange.svg)](https://livekit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ExLMS** là một hệ thống quản lý học tập (LMS) hiện đại, tập trung vào trải nghiệm học tập cộng tác thời gian thực. Hệ thống cung cấp đầy đủ các công cụ cho giảng viên và sinh viên từ quản lý khóa học, bài tập, đến các buổi học trực tuyến và soạn thảo văn bản đồng thời.

---

## ✨ Tính năng nổi bật

### 📚 Quản lý đào tạo
- **Khóa học & Bài học**: Quản lý nội dung học tập theo chương hồi, hỗ trợ video, văn bản và các tài nguyên đính kèm.
- **Quản lý nhóm (Groups)**: Tạo và tham gia các nhóm học tập chuyên biệt, quản lý thành viên và quyền hạn.

### 🎥 Cộng tác thời gian thực
- **Lớp học trực tuyến (Meeting)**: Tích hợp LiveKit cho phép hội thoại video chất lượng cao, chia sẻ màn hình, đặt câu hỏi và bình chọn (polls) ngay trong buổi học.
- **Soạn thảo đồng thời (Collab)**: Soạn thảo văn bản Real-time (tương tự Google Docs) dựa trên công nghệ Hocuspocus và Tiptap.

### 📝 Kiểm tra & Đánh giá
- **Hệ thống Bài tập (Assignments)**: Giao bài, nộp bài đa phương thức và chấm điểm trực tuyến.
- **Trắc nghiệm (Quizzes)**: Tạo ngân hàng câu hỏi, thiết lập thời gian làm bài và tự động chấm điểm.

### 💬 Tương tác & Thông báo
- **Diễn đàn (Forum)**: Nơi trao đổi kiến thức, thảo luận giữa các thành viên.
- **Bảng tin (Feed)**: Cập nhật các hoạt động mới nhất trong nhóm học tập.
- **Thông báo đa nền tảng**: Nhận thông báo tức thời qua WebSocket (Toast) và Email.

---

## 🛠 Công nghệ sử dụng

### Backend (Core)
- **Framework**: Spring Boot 3.x, Spring Security, Spring Data JPA.
- **Database**: MySQL 8.4 (Lưu trữ dữ liệu), Redis (Caching & Shared State).
- **Storage**: MinIO (Object Storage tương thích S3) để lưu trữ file tài liệu và ảnh.
- **Real-time**: WebSocket (STOMP), JavaMailSender.

### Microservices
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
Sao chép file `.env.example` thành `.env` và cập nhật các thông số cần thiết:
```bash
cp .env.example .env
```
*Lưu ý: Đảm bảo kiểm tra các khóa bí mật (JWT Secret, LiveKit API Key) và thông tin SMTP Mail.*

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
