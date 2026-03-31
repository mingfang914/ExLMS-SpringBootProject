package project.TeamFive.ExLMS.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.auth.dto.request.GoogleOAuth2Request;
import project.TeamFive.ExLMS.auth.dto.response.AuthResponse;
import project.TeamFive.ExLMS.user.entity.Role;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.entity.UserSession;
import project.TeamFive.ExLMS.user.repository.UserRepository;
import project.TeamFive.ExLMS.user.repository.UserSessionRepository;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Service xử lý xác thực Google OAuth2 Authorization Code flow.
 *
 * Luồng:
 * 1. Exchange authorization_code -> Google id_token + access_token
 * 2. Verify id_token, extract payload (email, name, sub)
 * 3. Auto-create hoặc tìm User theo email
 * 4. Tạo JWT nội bộ + UserSession
 * 5. Trả về AuthResponse (tuân thủ spring-boot-architecture: không leak Entity)
 *
 * Tuân thủ common-security-standards:
 * - Không hardcode secrets (dùng @Value + env vars)
 * - Không log PII chi tiết
 * - Không lộ stack trace qua API (exception được handle tập trung qua GlobalExceptionHandler)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2GoogleService {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final JwtService jwtService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleOAuth2Request request) {
        log.info("DEBUG: Google Client ID loaded: {}...{}", 
            googleClientId.substring(0, Math.min(5, googleClientId.length())),
            googleClientId.substring(Math.max(0, googleClientId.length() - 5)));
            
        // Bước 1: Exchange code → Google tokens
        GoogleTokenResponse tokenResponse = exchangeCodeForTokens(request.getCode(), request.getRedirectUri());

        // Bước 2: Verify id_token và extract user info
        GoogleIdToken.Payload payload = verifyAndExtractPayload(tokenResponse.getIdToken());

        String email   = payload.getEmail();
        String name    = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        log.info("Google OAuth2 login attempt for user with email domain: {}",
                email.contains("@") ? email.split("@")[1] : "unknown");

        // Bước 3: Auto-provision hoặc tìm User
        User user = findOrCreateUser(email, name, picture);

        // Bước 4: Tạo JWT + Session nội bộ
        String accessToken  = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        UserSession session = UserSession.builder()
                .user(user)
                .refreshToken(refreshToken)
                .ipAddress("oauth2-google")
                .userAgent("Google OAuth2")
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        userSessionRepository.save(session);

        // Bước 5: Trả về AuthResponse (không leak Entity - tuân thủ spring-boot-architecture)
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .avatarKey(user.getAvatarKey())
                .message("Đăng nhập Google thành công!")
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────

    private GoogleTokenResponse exchangeCodeForTokens(String code, String redirectUri) {
        try {
            return new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    googleClientId,
                    googleClientSecret,
                    code,
                    redirectUri
            ).execute();
        } catch (IOException e) {
            // Tuân thủ common-error-handling: không lộ raw exception message ra API
            log.warn("Failed to exchange Google authorization code: {}", e.getMessage());
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_grant"),
                    "Authorization code không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
            );
        }
    }

    private GoogleIdToken.Payload verifyAndExtractPayload(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("invalid_token"),
                        "Google ID token không hợp lệ hoặc đã hết hạn."
                );
            }
            return idToken.getPayload();

        } catch (OAuth2AuthenticationException e) {
            throw e;
        } catch (GeneralSecurityException | IOException e) {
            log.warn("Failed to verify Google id_token: {}", e.getMessage());
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("token_verification_failed"),
                    "Không thể xác minh danh tính từ Google. Vui lòng thử lại."
            );
        }
    }

    private User findOrCreateUser(String email, String name, String picture) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Auto-provisioning new user via Google OAuth2");

            // Google đã verify email => emailVerified = true
            // passwordHash = null vì user không có mật khẩu nội bộ
            // avatarKey = null (column length=36 cho MinIO UUID key, không lưu được Google URL)
            User newUser = User.builder()
                    .email(email)
                    .passwordHash(null)
                    .fullName(name != null ? name : email.split("@")[0])
                    .role(Role.STUDENT)
                    .status("ACTIVE")
                    .emailVerified(true)
                    .avatarKey(null)
                    .build();

            return userRepository.save(newUser);
        });
    }
}
