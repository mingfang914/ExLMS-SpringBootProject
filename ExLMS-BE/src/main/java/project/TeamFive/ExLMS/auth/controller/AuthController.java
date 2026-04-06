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
    public ResponseEntity<java.util.Map<String, String>> register(@RequestBody RegisterRequest request) {
        String responseMessage = authService.register(request);
        java.util.Map<String, String> body = new java.util.HashMap<>();
        body.put("message", responseMessage);
        return ResponseEntity.ok(body);
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
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String message = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(java.util.Map.of("message", message));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", message));
    }
}
