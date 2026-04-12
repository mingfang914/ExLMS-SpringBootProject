package project.TeamFive.ExLMS.course.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.course.dto.request.CourseRequest;
import project.TeamFive.ExLMS.course.dto.response.CourseResponse;
import project.TeamFive.ExLMS.course.service.CourseService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import project.TeamFive.ExLMS.user.entity.User;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups/{groupId}/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // [CREATE] Tạo khóa học mới trong nhóm
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(
            @PathVariable UUID groupId,
            @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(groupId, request));
    }

    // [READ] Lấy danh sách khóa học của nhóm
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(
            @PathVariable UUID groupId) {
        return ResponseEntity.ok(courseService.getCoursesByGroupId(groupId));
    }

    @GetMapping("/{deploymentId}")
    public ResponseEntity<CourseResponse> getCourseById(
            @PathVariable UUID groupId,
            @PathVariable UUID deploymentId) {
        return ResponseEntity.ok(courseService.getCourseDeploymentById(deploymentId));
    }

    @PutMapping("/{deploymentId}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable UUID groupId,
            @PathVariable UUID deploymentId,
            @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourseDeployment(deploymentId, request));
    }

    @PostMapping("/{deploymentId}/full-save")
    public ResponseEntity<CourseResponse> fullSave(
            @PathVariable UUID groupId,
            @PathVariable UUID deploymentId,
            @RequestBody project.TeamFive.ExLMS.course.dto.request.FullCourseRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(courseService.saveFullCourse(deploymentId, request, user));
    }

    @DeleteMapping("/{deploymentId}")
    public ResponseEntity<String> deleteCourse(
            @PathVariable UUID groupId,
            @PathVariable UUID deploymentId) {
        return ResponseEntity.ok(courseService.deleteCourseDeployment(deploymentId));
    }
}
