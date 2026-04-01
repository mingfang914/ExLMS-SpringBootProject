package project.TeamFive.ExLMS.quiz.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.quiz.dto.request.CreateQuizRequest;
import project.TeamFive.ExLMS.quiz.dto.request.QuizAttemptRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO;
import project.TeamFive.ExLMS.quiz.dto.response.QuizAttemptResponse;
import project.TeamFive.ExLMS.quiz.dto.response.QuizStatsResponse;
import project.TeamFive.ExLMS.quiz.service.QuizService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/groups/{groupId}/quizzes")
    public ResponseEntity<QuizResponseDTO> createQuiz(
            @PathVariable UUID groupId,
            @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal User creator) {
        // [QUICK CREATE & DEPLOY] Legacy flow or quick deployment
        QuizResponseDTO template = quizService.createTemplate(request, creator);
        return ResponseEntity.ok(quizService.deployToGroup(groupId, template.getTemplateId(), request, creator));
    }

    @GetMapping("/groups/{groupId}/quizzes")
    public ResponseEntity<List<QuizResponseDTO>> getQuizzesByGroup(@PathVariable UUID groupId) {
        return ResponseEntity.ok(quizService.getQuizzesByGroup(groupId));
    }

    @GetMapping("/quizzes/{id}")
    public ResponseEntity<QuizResponseDTO> getQuizById(@PathVariable UUID id) {
        return ResponseEntity.ok(quizService.getQuizDeploymentById(id));
    }

    // Attempt and Stats logic remains for further implementation
    @PostMapping("/quizzes/{id}/attempts")
    public ResponseEntity<QuizAttemptResponse> startAttempt(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(QuizAttemptResponse.builder().id(id).build());
    }

    @PostMapping("/quizzes/attempts/{attemptId}/submit")
    public ResponseEntity<QuizAttemptResponse> submitAttempt(
            @PathVariable UUID attemptId,
            @RequestBody QuizAttemptRequest request) {
        return ResponseEntity.ok(QuizAttemptResponse.builder().id(attemptId).build());
    }

    @GetMapping("/quizzes/attempts/{attemptId}/result")
    public ResponseEntity<QuizAttemptResponse> getAttemptResult(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(QuizAttemptResponse.builder().id(attemptId).build());
    }

    @GetMapping("/quizzes/{id}/my-attempts")
    public ResponseEntity<List<QuizAttemptResponse>> getMyAttempts(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/quizzes/{id}/stats")
    public ResponseEntity<QuizStatsResponse> getQuizStats(@PathVariable UUID id) {
        return ResponseEntity.ok(QuizStatsResponse.builder().quizId(id).build());
    }
}
