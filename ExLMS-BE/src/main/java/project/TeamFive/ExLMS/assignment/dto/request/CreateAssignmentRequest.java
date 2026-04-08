package project.TeamFive.ExLMS.assignment.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    private String coverImageUrl;
    
    @JsonProperty("maxScore")
    private Integer maxScore;
    
    private LocalDateTime assignedAt;
    private LocalDateTime dueAt;
    
    @JsonProperty("submissionType")
    private String submissionType;
    
    @JsonProperty("allowedFileTypes")
    private String allowedFileTypes;
    
    @JsonProperty("maxFileSizeMb")
    private Integer maxFileSizeMb;
    
    private Boolean allowLate;
    private Integer latePenaltyPercent;
    
    private String status; // DRAFT, PUBLISHED, CLOSED
}
