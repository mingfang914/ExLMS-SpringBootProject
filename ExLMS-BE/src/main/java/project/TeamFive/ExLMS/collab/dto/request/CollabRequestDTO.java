package project.TeamFive.ExLMS.collab.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CollabRequestDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    private String coverImageKey;

    @NotNull(message = "Thời gian bắt đầu là bắt buộc")
    @FutureOrPresent(message = "Thời gian bắt đầu phải từ thời điểm hiện tại trở đi")
    private LocalDateTime startAt;

    private LocalDateTime endAt;
}
