package project.TeamFive.ExLMS.assignment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.assignment.entity.Assignment;

import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponseDTO {
    private UUID id;             // This is the deployment ID (GroupAssignment ID)
    private UUID templateId;     // This is the template ID (Assignment ID)
    private String title;
    private String description;
    private String coverImageUrl;
    private LocalDateTime dueDate;
    private UUID groupId;
    private int maxScore;
    private LocalDateTime assignedAt;
    private LocalDateTime dueAt;
    private Assignment.SubmissionType submissionType;
    private String allowedFileTypes;
    private int maxFileSizeMb;
    private boolean allowLate;
    private int latePenaltyPercent;
    private GroupAssignment.GroupAssignmentStatus status;

    public static AssignmentResponseDTO fromEntity(GroupAssignment deployment) {
        Assignment template = deployment.getAssignment();
        return AssignmentResponseDTO.builder()
                .id(deployment.getId())
                .templateId(template.getId())
                .title(template.getTitle())
                .description(project.TeamFive.ExLMS.util.UrlUtils.normalizeCkeUrls(template.getDescription()))
                .groupId(deployment.getGroup().getId())
                .maxScore(template.getMaxScore())
                .assignedAt(deployment.getAssignedAt())
                .dueAt(deployment.getDueAt())
                .submissionType(template.getSubmissionType())
                .allowedFileTypes(template.getAllowedFileTypes())
                .maxFileSizeMb(template.getMaxFileSizeMb())
                .allowLate(deployment.isAllowLate())
                .latePenaltyPercent(deployment.getLatePenaltyPercent())
                .coverImageUrl(template.getCoverImageKey() != null ? "/api/files/download/" + template.getCoverImageKey() : "/api/files/download/Assets/AssignmentDefaultCover.jpg")
                .status(deployment.getStatus())
                .build();
    }
}
