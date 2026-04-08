package project.TeamFive.ExLMS.collab.dto.response;

import lombok.Builder;
import lombok.Data;
import project.TeamFive.ExLMS.collab.entity.GroupCollab;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CollabResponseDTO {
    private UUID id;
    private UUID groupId;
    private String title;
    private String description;
    private String documentData;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private GroupCollab.CollabStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CollabResponseDTO fromEntity(GroupCollab collab) {
        return CollabResponseDTO.builder()
                .id(collab.getId())
                .groupId(collab.getGroup().getId())
                .title(collab.getTitle())
                .description(collab.getDescription())
                .documentData(collab.getDocumentData())
                .startAt(collab.getStartAt())
                .endAt(collab.getEndAt())
                .status(collab.getStatus())
                .createdAt(collab.getCreatedAt())
                .updatedAt(collab.getUpdatedAt())
                .build();
    }
}
