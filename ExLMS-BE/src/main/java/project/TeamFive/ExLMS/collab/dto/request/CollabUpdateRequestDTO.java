package project.TeamFive.ExLMS.collab.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import project.TeamFive.ExLMS.collab.entity.GroupCollab;

import java.time.LocalDateTime;

@Data
public class CollabUpdateRequestDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    private LocalDateTime endAt;

    private GroupCollab.CollabStatus status;
}
