package project.TeamFive.ExLMS.group.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GroupEventResponse {
    private UUID id;
    private UUID groupId;
    private UUID createdBy;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String color;
    private LocalDateTime createdAt;
}
