package project.TeamFive.ExLMS.course.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.course.entity.GroupCourse;

@Getter
public class CourseCreatedEvent extends ApplicationEvent {
    private final GroupCourse groupCourse;

    public CourseCreatedEvent(Object source, GroupCourse groupCourse) {
        super(source);
        this.groupCourse = groupCourse;
    }
}
