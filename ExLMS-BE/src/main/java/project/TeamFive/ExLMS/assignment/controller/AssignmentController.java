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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping("/groups/{groupId}/assignments")
    public ResponseEntity<AssignmentResponseDTO> createAssignment(
            @PathVariable UUID groupId,
            @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal User creator) {
        // Create template and deploy it (retro-compatibility)
        AssignmentResponseDTO template = assignmentService.createTemplate(request, creator);
        return ResponseEntity.ok(assignmentService.deployToGroup(groupId, template.getTemplateId(), request, creator));
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<AssignmentResponseDTO> getAssignmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(assignmentService.getAssignmentDeploymentById(id));
    }

    @GetMapping("/groups/{groupId}/assignments")
    public ResponseEntity<List<AssignmentResponseDTO>> getAssignmentsByGroup(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByGroup(groupId, user));
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<AssignmentResponseDTO> updateAssignment(
            @PathVariable UUID id,
            @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(assignmentService.updateAssignmentDeployment(id, request, user));
        } catch (Exception e) {
            return ResponseEntity.ok(assignmentService.updateTemplate(id, request, user));
        }
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable UUID id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
