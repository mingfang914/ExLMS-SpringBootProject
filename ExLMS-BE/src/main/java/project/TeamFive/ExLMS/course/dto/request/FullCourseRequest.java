package project.TeamFive.ExLMS.course.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class FullCourseRequest {
    private CourseRequest info;
    private List<ChapterFullRequest> chapters;

    @Data
    public static class ChapterFullRequest {
        private java.util.UUID id; // null if new
        private String title;
        private String description;
        private boolean locked;
        private int orderIndex;
        private List<LessonFullRequest> lessons;
    }

    @Data
    public static class LessonFullRequest {
        private java.util.UUID id; // null if new
        private String title;
        private String content;
        private String resourceKey;
        private Integer durationSeconds;
        private int orderIndex;
    }
}
