package project.TeamFive.ExLMS.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private UUID id;             // Deployment (GroupCourse) ID
    private UUID templateId;     // Template (Course) ID
    private String title;
    private String description;
    private String status;
    private UUID groupId;
    private String thumbnailUrl;
    private LocalDate startDate;
    private LocalDate endDate;
}
