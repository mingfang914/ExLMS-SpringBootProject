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
    private final project.TeamFive.ExLMS.quiz.service.CourseQuizService courseQuizService;

    // [READ] Lấy danh sách khóa học mẫu của cá nhân
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getMyTemplates(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(courseService.getTemplatesByCreator(user));
    }

    // [READ] Chi tiết bản mẫu
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getTemplate(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getTemplateById(id));
    }

    // [READ] Lấy danh sách quiz liên kết với course template
    @GetMapping("/{id}/quizzes")
    public ResponseEntity<List<project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO>> getCourseQuizzes(@PathVariable UUID id) {
        // Since we need QuizResponseDTO, let's use QuizService too or just DTO mapping
        // To be quick, I'll just return the Quiz entities mapped to simplified responses 
        // OR better, I should use the QuizService map method
        return ResponseEntity.ok(courseQuizService.getQuizzesByCourseId(id).stream()
                .map(q -> project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO.builder()
                        .templateId(q.getId())
                        .title(q.getTitle())
                        .description(q.getDescription())
                        .timeLimitSec(q.getTimeLimitSec())
                        .maxAttempts(q.getMaxAttempts())
                        .passingScore(q.getPassingScore())
                        .build())
                .collect(java.util.stream.Collectors.toList()));
    }

    // [UPDATE] Liên kết hàng loạt trắc nghiệm vào khóa học mẫu
    @PostMapping("/{id}/quizzes")
    public ResponseEntity<Void> associateQuizzes(
            @PathVariable UUID id,
            @RequestBody List<UUID> quizIds,
            @AuthenticationPrincipal User user) {
        courseQuizService.associateQuizzes(id, quizIds);
        return ResponseEntity.ok().build();
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

    // [DELETE] Xóa bản thiết kế
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTemplate(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(courseService.deleteTemplate(id, user));
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
