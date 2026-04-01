package project.TeamFive.ExLMS.course.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.course.dto.request.CourseRequest;
import project.TeamFive.ExLMS.course.dto.response.CourseResponse;
import project.TeamFive.ExLMS.course.service.CourseService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory/courses")
@RequiredArgsConstructor
public class CourseInventoryController {

    private final CourseService courseService;

    // [READ] Lấy danh sách khóa học mẫu của cá nhân
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getMyTemplates(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(courseService.getTemplatesByCreator(user));
    }

    // [READ] Chi tiết bản mẫu
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getTemplate(@PathVariable UUID id) {
        // reuse getCourseByDeployment or specific template method
        return ResponseEntity.ok(courseService.getTemplateById(id));
    }

    // [CREATE] Tạo bản thiết kế khóa học mới trong kho
    @PostMapping
    public ResponseEntity<CourseResponse> createTemplate(
            @RequestBody CourseRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(courseService.createTemplate(request, user));
    }

    // [UPDATE] Cập nhật bản thiết kế trong kho
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateTemplate(
            @PathVariable UUID id,
            @RequestBody CourseRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(courseService.updateTemplate(id, request, user));
    }

    // [DEPLOY] Đưa khóa học vào nhóm
    @PostMapping("/deploy/{groupId}")
    public ResponseEntity<Void> deployToGroup(
            @PathVariable UUID groupId,
            @RequestBody DeployRequest request,
            @AuthenticationPrincipal User user) {
        courseService.deployCourses(groupId, request.getTemplateIds(), request.getDeploymentConfig(), user);
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class DeployRequest {
        private List<UUID> templateIds;
        private CourseRequest deploymentConfig;
    }
}
