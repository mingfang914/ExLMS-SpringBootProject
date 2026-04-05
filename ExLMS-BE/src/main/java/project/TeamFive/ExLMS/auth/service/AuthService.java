package project.TeamFive.ExLMS.auth.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.auth.dto.request.LoginRequest;
import project.TeamFive.ExLMS.auth.dto.request.RegisterRequest;
import project.TeamFive.ExLMS.auth.dto.response.AuthResponse;
import project.TeamFive.ExLMS.user.entity.Role;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.entity.UserSession;
import project.TeamFive.ExLMS.user.repository.UserRepository;
import project.TeamFive.ExLMS.user.repository.UserSessionRepository;
import project.TeamFive.ExLMS.service.EmailService;
import project.TeamFive.ExLMS.auth.dto.request.ForgotPasswordRequest;
import project.TeamFive.ExLMS.auth.dto.request.ResetPasswordRequest;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final HttpServletRequest httpServletRequest;
    private final EmailService emailService;
    
    @org.springframework.beans.factory.annotation.Value("${APP_FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;


    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng!");
        }

        String password = request.getPassword();
        if (password == null || password.length() < 8 ||
            !password.matches(".*[A-Z]..*") ||
            !password.matches(".*[a-z]..*") ||
            !password.matches(".*[0-9]..*") ||
            !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new RuntimeException("Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!");
        }

        Role role = Role.STUDENT;
        String status = "ACTIVE";
        
        if ("INSTRUCTOR".equalsIgnoreCase(request.getDesiredRole())) {
            role = Role.INSTRUCTOR;
            status = "PENDING"; // Chờ Admin duyệt
        } else if ("ADMIN".equalsIgnoreCase(request.getDesiredRole())) {
            throw new RuntimeException("Không được phép đăng ký tài khoản Quản trị viên!");
        }

        User newUser = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .status(status)
                .emailVerified(false)
                .failedLoginCount(0)
                .avatarKey("DefaultAvatar.png")
                .build();

        userRepository.save(newUser);

        if ("PENDING".equals(status)) {
            return "Đăng ký thành công! Tài khoản Giảng viên của bạn đang chờ Quản trị viên phê duyệt.";
        }
        return "Đăng ký tài khoản Sinh viên thành công!";
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không chính xác!"));

        // 1. Kiểm tra trạng thái khóa
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Tài khoản đã bị khóa tạm thời. Vui lòng thử lại sau 30 phút!");
        }

        // 2. Kiểm tra trạng thái phê duyệt / cấm
        if ("PENDING".equals(user.getStatus())) {
            throw new RuntimeException("Tài khoản của bạn đang chờ phê duyệt từ Admin!");
        } else if ("SUSPENDED".equals(user.getStatus()) || "DELETED".equals(user.getStatus())) {
            throw new RuntimeException("Tài khoản của bạn đã bị vô hiệu hóa!");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            // Xử lý đếm ngược khóa tài khoản
            int failedAttempts = user.getFailedLoginCount() + 1;
            user.setFailedLoginCount(failedAttempts);
            
            if (failedAttempts >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
                userRepository.save(user);
                throw new RuntimeException("Bạn đã nhập sai mật khẩu 5 lần. Tài khoản bị khóa 30 phút để bảo vệ an toàn!");
            }
            userRepository.save(user);
            throw new RuntimeException("Email hoặc mật khẩu không chính xác! Bạn còn " + (5 - failedAttempts) + " lần thử.");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống khi đăng nhập!");
        }

        // Đăng nhập thành công -> Reset đếm khóa
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Sinh JWT
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Sinh Session lưu lại nhật ký thiết bị
        String ipAddress = httpServletRequest.getRemoteAddr();
        String userAgent = httpServletRequest.getHeader("User-Agent");

        UserSession session = UserSession.builder()
                .user(user)
                .refreshToken(refreshToken)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
                
        userSessionRepository.save(session);

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .avatarKey(user.getAvatarKey())
                .message("Đăng nhập thành công!")
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        UserSession session = userSessionRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ hoặc đã bị đăng xuất!"));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            userSessionRepository.delete(session);
            throw new RuntimeException("Phiên đăng nhập đã hết hạn (7 ngày). Vui lòng đăng nhập lại!");
        }

        User user = session.getUser();
        String newAccessToken = jwtService.generateToken(user);
        
        // Có thể Rotate refresh token ở đây nếu muốn bảo mật tối đa, nhưng tạm giữ nguyên theo SRS
        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Làm mới token thành công!")
                .build();
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống!"));

        // Tạo token ngẫu nhiên
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpires(LocalDateTime.now().plusHours(1)); // Hết hạn sau 1 giờ

        userRepository.save(user);

        // Gửi email
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);
        } catch (jakarta.mail.MessagingException e) {
            throw new RuntimeException("Không thể gửi email lúc này. Vui lòng thử lại sau!");
        }

        return "Link đặt lại mật khẩu đã được gửi vào email của bạn. Vui lòng kiểm tra hộp thư!";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Link đổi mật khẩu không hợp lệ hoặc đã hết hạn!"));

        if (user.getResetTokenExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Link đổi mật khẩu đã hết hạn!");
        }

        // Validate mật khẩu mới
        String password = request.getNewPassword();
        if (password == null || password.length() < 8 ||
            !password.matches(".*[A-Z]..*") ||
            !password.matches(".*[a-z]..*") ||
            !password.matches(".*[0-9]..*") ||
            !password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new RuntimeException("Mật khẩu mới phải dài ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!");
        }

        // Cập nhật mật khẩu
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpires(null);

        userRepository.save(user);

        return "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.";
    }
}
