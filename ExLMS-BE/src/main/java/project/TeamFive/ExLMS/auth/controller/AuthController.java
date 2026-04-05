package project.TeamFive.ExLMS.auth.controller;

import jakarta.validation.Valid;
import project.TeamFive.ExLMS.auth.service.AuthService;
import project.TeamFive.ExLMS.auth.service.OAuth2GoogleService;
import lombok.RequiredArgsConstructor;
import project.TeamFive.ExLMS.auth.dto.request.GoogleOAuth2Request;
import project.TeamFive.ExLMS.auth.dto.request.RegisterRequest;
import project.TeamFive.ExLMS.auth.dto.request.LoginRequest;
import project.TeamFive.ExLMS.auth.dto.request.ForgotPasswordRequest;
import project.TeamFive.ExLMS.auth.dto.request.ResetPasswordRequest;
import project.TeamFive.ExLMS.auth.dto.response.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OAuth2GoogleService oAuth2GoogleService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        String responseMessage = authService.register(request);
        return ResponseEntity.ok(responseMessage);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.refreshToken(token));
    }

    /**
     * Endpoint nhận authorization_code từ Frontend (Google OAuth2 flow).
     * Frontend dùng @react-oauth/google với flow='auth-code'.
     */
    @PostMapping("/oauth2/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleOAuth2Request request) {
        return ResponseEntity.ok(oAuth2GoogleService.authenticateWithGoogle(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}
