package project.TeamFive.ExLMS.collab.dto.response;

import lombok.Builder;
import lombok.Data;
import project.TeamFive.ExLMS.collab.entity.CollabParticipant;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CollabParticipantResponseDTO {
    private UUID id;
    private UUID collabId;
    private UUID userId;
    private String userName;
    private LocalDateTime joinedAt;
    private LocalDateTime lastActiveAt;

    public static CollabParticipantResponseDTO fromEntity(CollabParticipant participant) {
        return CollabParticipantResponseDTO.builder()
                .id(participant.getId())
                .collabId(participant.getCollab().getId())
                .userId(participant.getUser().getId())
                .userName(participant.getUser().getFullName() != null ? participant.getUser().getFullName() : participant.getUser().getEmail())
                .joinedAt(participant.getJoinedAt())
                .lastActiveAt(participant.getLastActiveAt())
                .build();
    }
}
