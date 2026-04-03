package project.TeamFive.ExLMS.meeting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.meeting.entity.Meeting;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingResponseDTO {
    private UUID id;
    private String title;
    private String description;
    private UUID groupId;
    private String platform;
    private String joinUrl;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private int durationMinutes;
    private Meeting.MeetingStatus status;
    private String currentUserRole;

    public static MeetingResponseDTO fromEntity(Meeting meeting) {
        MeetingResponseDTO dto = new MeetingResponseDTO();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setGroupId(meeting.getGroup().getId());
        dto.setPlatform(meeting.getPlatform());
        dto.setJoinUrl(meeting.getJoinUrl());
        dto.setStartAt(meeting.getStartAt());
        dto.setEndAt(meeting.getEndAt());
        if (meeting.getStartAt() != null && meeting.getEndAt() != null) {
            dto.setDurationMinutes((int) java.time.Duration.between(meeting.getStartAt(), meeting.getEndAt()).toMinutes());
        }
        dto.setStatus(meeting.getStatus());
        return dto;
    }
}
