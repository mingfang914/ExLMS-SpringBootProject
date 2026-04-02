package project.TeamFive.ExLMS.assignment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.assignment.dto.request.CreateAssignmentRequest;
import project.TeamFive.ExLMS.assignment.dto.response.AssignmentResponseDTO;
import project.TeamFive.ExLMS.assignment.service.AssignmentService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/assignments")
@RequiredArgsConstructor
public class AssignmentInventoryController {

    private final AssignmentService assignmentService;

    // [READ] Lấy danh sách bài tập mẫu
    @GetMapping
    public ResponseEntity<List<AssignmentResponseDTO>> getMyTemplates(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assignmentService.getTemplatesByCreator(user));
    }

    // [READ] Chi tiết bản mẫu
    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponseDTO> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(assignmentService.getTemplateById(id));
    }

    // [CREATE] Tạo bản thiết kế bài tập trong kho
    @PostMapping
    public ResponseEntity<AssignmentResponseDTO> createTemplate(
            @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assignmentService.createTemplate(request, user));
    }

    // [UPDATE] Cập nhật bản thiết kế bài tập trong kho
    @PutMapping("/{id}")
    public ResponseEntity<AssignmentResponseDTO> updateTemplate(
            @PathVariable UUID id,
            @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assignmentService.updateTemplate(id, request, user));
    }

    // [DELETE] Xóa bản mẫu
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        assignmentService.deleteTemplate(id, user);
        return ResponseEntity.noContent().build();
    }

    // [DEPLOY] Đưa bài tập từ kho vào nhóm
    @PostMapping("/deploy/{groupId}")
    public ResponseEntity<Void> deployToGroup(
            @PathVariable UUID groupId,
            @RequestBody DeployRequest request,
            @AuthenticationPrincipal User user) {
        for (UUID templateId : request.getTemplateIds()) {
            assignmentService.deployToGroup(groupId, templateId, request.getDeploymentConfig(), user);
        }
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class DeployRequest {
        private List<UUID> templateIds;
        private CreateAssignmentRequest deploymentConfig;
    }
}
