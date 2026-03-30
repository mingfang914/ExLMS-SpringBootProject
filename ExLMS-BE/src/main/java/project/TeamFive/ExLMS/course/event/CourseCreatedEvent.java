package project.TeamFive.ExLMS.course.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.course.entity.Course;

@Getter
public class CourseCreatedEvent extends ApplicationEvent {
    private final Course course;

    public CourseCreatedEvent(Object source, Course course) {
        super(source);
        this.course = course;
    }
}
