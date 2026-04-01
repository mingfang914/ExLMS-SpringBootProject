package project.TeamFive.ExLMS.quiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.quiz.entity.Quiz;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    @NotBlank
    private String title;
    private String description;
    private UUID groupId;
    private UUID chapterId;
    @Min(0)
    private Integer timeLimitSec;
    @Builder.Default
    @Min(1)
    private int maxAttempts = 1;
    @Builder.Default
    @Min(0)
    private int passingScore = 50;
    @Builder.Default
    private boolean shuffleQuestions = false;
    @Builder.Default
    private Quiz.ResultVisibility resultVisibility = Quiz.ResultVisibility.IMMEDIATE;
    private LocalDateTime openAt;
    private LocalDateTime closeAt;
    private List<QuestionRequest> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionRequest {
        private String content;
        private String questionType;
        private int points;
        private String explanation;
        private List<AnswerRequest> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerRequest {
        private String content;
        private boolean correct;
    }
}
