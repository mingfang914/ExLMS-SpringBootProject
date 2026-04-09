package project.TeamFive.ExLMS.collab.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import project.TeamFive.ExLMS.collab.entity.GroupCollab.CollabStatus;

@Data
public class CollabStatusUpdateDTO {

    @NotNull(message = "Trạng thái không được để trống")
    private CollabStatus status;
}
