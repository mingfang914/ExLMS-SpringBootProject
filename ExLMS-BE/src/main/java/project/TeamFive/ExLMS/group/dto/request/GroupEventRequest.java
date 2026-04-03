package project.TeamFive.ExLMS.group.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GroupEventRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    
    private String location;

    @NotNull(message = "Start time is required")
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    private String color;
}
