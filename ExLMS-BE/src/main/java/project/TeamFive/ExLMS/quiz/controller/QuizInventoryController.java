package project.TeamFive.ExLMS.quiz.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.quiz.dto.request.CreateQuizRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO;
import project.TeamFive.ExLMS.quiz.service.QuizService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/quizzes")
@RequiredArgsConstructor
public class QuizInventoryController {

    private final QuizService quizService;

    // [READ] Lấy danh sách bài trắc nghiệm mẫu
    @GetMapping
    public ResponseEntity<List<QuizResponseDTO>> getMyTemplates(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.getTemplatesByCreator(user));
    }

    // [READ] Chi tiết bản mẫu
    @GetMapping("/{id}")
    public ResponseEntity<QuizResponseDTO> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getTemplateById(id));
    }

    // [CREATE] Tạo bài kiểm tra mẫu trong kho
    @PostMapping
    public ResponseEntity<QuizResponseDTO> createTemplate(
            @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.createTemplate(request, user));
    }

    // [UPDATE] Cập nhật bài kiểm tra mẫu trong kho
    @PutMapping("/{id}")
    public ResponseEntity<QuizResponseDTO> updateTemplate(
            @PathVariable UUID id,
            @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(quizService.updateTemplate(id, request, user));
    }

    // [DELETE] Xóa bản mẫu
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        quizService.deleteTemplate(id, user);
        return ResponseEntity.noContent().build();
    }

    // [DEPLOY] Đưa trắc nghiệm vào nhóm
    @PostMapping("/deploy/{groupId}")
    public ResponseEntity<Void> deployToGroup(
            @PathVariable UUID groupId,
            @RequestBody DeployRequest request,
            @AuthenticationPrincipal User user) {
        for (UUID templateId : request.getTemplateIds()) {
            quizService.deployToGroup(groupId, templateId, request.getDeploymentConfig(), user);
        }
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class DeployRequest {
        private List<UUID> templateIds;
        private CreateQuizRequest deploymentConfig;
    }
}
