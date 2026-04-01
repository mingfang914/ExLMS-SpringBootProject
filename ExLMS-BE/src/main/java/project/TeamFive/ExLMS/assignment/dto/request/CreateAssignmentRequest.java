package project.TeamFive.ExLMS.assignment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.assignment.entity.Assignment;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssignmentRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private UUID groupId;
    private UUID courseId; // For matching Chapter if needed
    private Integer maxScore;
    private LocalDateTime assignedAt;
    private LocalDateTime dueAt;
    private Assignment.SubmissionType submissionType;
    private String allowedFileTypes;
    private Integer maxFileSizeMb;
    private Boolean allowLate;
    private Integer latePenaltyPercent;
}
