package project.TeamFive.ExLMS.collab.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CollabResponseDTO {
    private UUID id;
    private UUID groupId;
    private String title;
    private String description;
    private String coverImageUrl;
    private String documentData;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CollabResponseDTO fromEntity(project.TeamFive.ExLMS.collab.entity.GroupCollab entity) {
        return CollabResponseDTO.builder()
                .id(entity.getId())
                .groupId(entity.getGroup().getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .coverImageUrl(entity.getCoverImageKey() != null ? "/api/files/download/" + entity.getCoverImageKey()
                        : "/api/files/download/Assets/CollabDefaultCover.png")
                .documentData(entity.getDocumentData())
                .startAt(entity.getStartAt())
                .endAt(entity.getEndAt())
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
