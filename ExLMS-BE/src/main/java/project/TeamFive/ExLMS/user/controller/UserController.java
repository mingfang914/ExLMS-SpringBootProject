package project.TeamFive.ExLMS.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.dto.request.ProfileUpdateRequest;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;
import project.TeamFive.ExLMS.service.FileService;

import java.util.Map;
import java.util.HashMap;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(@AuthenticationPrincipal User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("name", user.getFullName());
        response.put("bio", user.getBio());
        response.put("role", user.getRole() != null ? user.getRole().name() : null);
        response.put("status", user.getStatus());
        
        if (user.getCreatedAt() != null) {
            response.put("createdAt", user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME));
        } else {
            response.put("createdAt", null);
        }
        
        String avatarUrl = null;
        if (user.getAvatarKey() != null && !user.getAvatarKey().trim().isEmpty()) {
            avatarUrl = "/api/files/download/" + user.getAvatarKey();
        }
        response.put("avatarKey", user.getAvatarKey());
        response.put("avatarUrl", avatarUrl);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/profile")
    public ResponseEntity<String> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ProfileUpdateRequest request) {
        
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarKey() != null) {
            user.setAvatarKey(request.getAvatarKey());
        }

        userRepository.save(user);
        return ResponseEntity.ok("Cập nhật hồ sơ thành công!");
    }
}
