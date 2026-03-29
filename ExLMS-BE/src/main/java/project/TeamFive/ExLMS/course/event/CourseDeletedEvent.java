package project.TeamFive.ExLMS.course.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class CourseDeletedEvent extends ApplicationEvent {
    private final UUID courseId;

    public CourseDeletedEvent(Object source, UUID courseId) {
        super(source);
        this.courseId = courseId;
    }
}
