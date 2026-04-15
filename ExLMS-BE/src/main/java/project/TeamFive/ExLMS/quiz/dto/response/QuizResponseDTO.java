package project.TeamFive.ExLMS.quiz.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.quiz.entity.GroupQuiz;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponseDTO {
    private UUID id; // This is the deployment ID (GroupQuiz ID)
    private UUID templateId; // This is the template ID (Quiz ID)
    private String title;
    private String description;
    private String coverImageUrl;
    private Integer timeLimitSec;
    private int maxAttempts;
    private int passingScore;
    private int questionCount;

    // Deployment specific
    private LocalDateTime openAt;
    private LocalDateTime closeAt;
    private boolean shuffleQuestions;
    private GroupQuiz.ResultVisibility resultVisibility;
    private GroupQuiz.GroupQuizStatus status;

    private List<QuestionResponse> questions;
    private boolean hasAttempts;
    private int userAttemptCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private UUID id;
        private String content;
        private String questionType;
        private int points;
        private String explanation;
        private List<AnswerResponse> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerResponse {
        private UUID id;
        private String content;
        private boolean correct;
    }
}
