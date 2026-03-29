package project.TeamFive.ExLMS.course.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.course.entity.Course;

@Getter
public class CourseUpdatedEvent extends ApplicationEvent {
    private final Course course;

    public CourseUpdatedEvent(Object source, Course course) {
        super(source);
        this.course = course;
    }
}
