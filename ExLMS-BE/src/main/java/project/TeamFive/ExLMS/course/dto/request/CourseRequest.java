package project.TeamFive.ExLMS.course.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private String status;
    private String thumbnailKey;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
