package project.TeamFive.ExLMS.meeting.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.TeamFive.ExLMS.meeting.entity.Meeting;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMeetingRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String coverImageUrl;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Meeting.MeetingStatus status;
}
