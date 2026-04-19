# 🎓 ExLMS - Excellent Learning Management System

<div align="center">

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC-orange.svg)](https://livekit.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ExLMS** là một hệ thống quản lý học tập (LMS) hiện đại, tập trung vào trải nghiệm học tập cộng tác thời gian thực. Hệ thống cung cấp đầy đủ các công cụ chuyên nghiệp cho giảng viên và sinh viên.

[Tính năng](#-tính-năng-nổi-bật) • [Công nghệ](#-công-nghệ-sử-dụng) • [Cài đặt](#-hướng-dẫn-cài-đặt-nhanh) • [Cấu trúc](#-cấu-trúc-dự-án)

</div>

---

## 📸 Tổng quan giao diện

ExLMS sở hữu giao diện thân thiện với 2 chế độ **Sáng/Tối (Light/Dark mode)** và hỗ trợ song ngữ **Việt/Anh**.

<img width="100%" alt="ExLMS Dashboard" src="https://github.com/user-attachments/assets/a1717dc0-76f6-4fc8-9a9e-522bff8659c3" />

---

## ✨ Tính năng nổi bật

### 📚 Quản lý đào tạo & Nhóm
*   **Khóa học & Bài học**: Quản lý nội dung theo chương hồi, hỗ trợ đa phương tiện (Video, Tài liệu).
*   **Học nhóm (Groups)**: Không gian riêng cho từng nhóm, quản lý thành viên và quyền hạn chặt chẽ.

<p align="center">
  <img width="48%" src="https://github.com/user-attachments/assets/942bdde5-d2f8-4f44-9016-c3fef8f164ec" />
  <img width="48%" src="https://github.com/user-attachments/assets/1e32d99f-62e9-4203-9e71-8b301768b62d" />
</p>

### 🎥 Cộng tác thời gian thực (Real-time)
*   **Lớp học trực tuyến (Meeting)**: Hội thoại video chất lượng cao qua LiveKit, chia sẻ màn hình, đặt câu hỏi (Q&A) và Polls.
*   **Soạn thảo đồng thời (Collab)**: Trình soạn thảo văn bản đa người dùng (tương tự Google Docs) dựa trên Hocuspocus & Yjs.

<p align="center">
  <img width="48%" src="https://github.com/user-attachments/assets/d638fde6-69d1-4edc-82be-ba42a7eebc70" />
  <img width="48%" src="https://github.com/user-attachments/assets/db9d1cf2-b0c7-4b95-b661-9a65a8556746" />
</p>

### 📝 Kiểm tra & Đánh giá
*   **Hệ thống Bài tập (Assignments)**: Giao bài và nộp bài đa dạng, tích hợp bộ công cụ chấm điểm cho giảng viên.
*   **Trắc nghiệm (Quizzes)**: Ngân hàng câu hỏi, giới hạn thời gian và tự động chấm điểm tức thì.

<p align="center">
  <img width="48%" src="https://github.com/user-attachments/assets/cf39abfd-cd0d-4992-a397-5c7844122276" />
  <img width="48%" src="https://github.com/user-attachments/assets/ebef487f-481b-4d40-824f-1779baadc8e9" />
</p>
<p align="center">
  <img width="48%" src="https://github.com/user-attachments/assets/c2f3b484-a474-4418-85d0-6204c875443b" />
  <img width="48%" src="https://github.com/user-attachments/assets/3602633c-3779-44c0-96d5-42423bc46d9d" />
</p>

### 💬 Tương tác & Tiện ích
*   **Diễn đàn & Lịch biểu**: Thảo luận kiến thức qua Forum và theo dõi tiến độ qua Calendar trực quan.
*   **Thông báo thông minh**: Nhận thông báo thời gian thực qua Web App (Toast) và đồng bộ qua Email.

<p align="center">
  <img width="32%" src="https://github.com/user-attachments/assets/4b7ed2a7-6b31-4a3b-a007-4a4c8347c706" />
  <img width="32%" src="https://github.com/user-attachments/assets/67986505-1c3f-4844-a78f-7563ac646d89" />
  <img width="32%" src="https://github.com/user-attachments/assets/9ea8ec04-8287-421c-ae72-a11813d06a30" />
</p>

---

## 🛠 Công nghệ sử dụng

| Module | Công nghệ chính |
| :--- | :--- |
| **Backend** | Spring Boot 3.x, Spring Security, Data JPA, MySQL 8.4, Redis |
| **Storage** | MinIO (S3 Compatible Object Storage) |
| **Real-time** | WebSocket (STOMP), LiveKit (WebRTC), Hocuspocus (Yjs) |
| **Frontend** | React 18, Vite, Redux Toolkit, Material UI, Framer Motion |
| **Microservices** | Node.js (Express, Socket.io), Typescript |

---

## 🚀 Hướng dẫn cài đặt nhanh

### 1. Chuẩn bị
*   Đã cài đặt [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/).
*   Tài khoản Google Cloud (cho tính năng OAuth2).

### 2. Cấu hình môi trường
Sao chép file mẫu và cập nhật các thông số cần thiết trong `.env`:
```bash
cp .env.example .env
```

> [!IMPORTANT]
> Hãy đảm bảo cập nhật `JWT_SECRET_KEY`, `LIVEKIT_API_KEY/SECRET` và cấu hình `SMTP Mail` trước khi chạy. Tuyệt đối không chia sẻ file `.env` cá nhân.

### 3. Khởi chạy
```bash
docker compose up -d --build
```

| Dịch vụ | Địa chỉ truy cập |
| :--- | :--- |
| **Frontend** | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | [http://localhost:8081/api](http://localhost:8081/api) |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) |

---

## 📂 Cấu trúc dự án

```text
📦 ExLMS
 ┣ 📂 ExLMS-BE          # Source code Spring Boot (Backend chính)
 ┣ 📂 ExLMS-FE          # Source code React (Frontend)
 ┣ 📂 ExLMS-Meeting     # Service quản lý phòng họp (Node.js)
 ┣ 📂 ExLMS-Collab      # Service soạn thảo đồng thời (Node.js)
 ┣ 📂 Assets            # Tài nguyên hình ảnh, biểu tượng hệ thống
 ┣ 📜 docker-compose.yml # Cấu hình Docker Deployment
 ┗ 📜 README.md         # Tài liệu dự án
```

---

## 👥 Nhóm phát triển
Được thực hiện bởi **TeamFive (ExLMS Team)**.
*   **Lead Developer**: [@mingfang914](https://github.com/mingfang914)

---

## 📄 Giấy phép
Phát hành dưới giấy phép **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.
