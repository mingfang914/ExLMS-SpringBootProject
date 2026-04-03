package project.TeamFive.ExLMS.course.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.course.entity.GroupCourse;

@Getter
public class CourseUpdatedEvent extends ApplicationEvent {
    private final GroupCourse groupCourse;

    public CourseUpdatedEvent(Object source, GroupCourse groupCourse) {
        super(source);
        this.groupCourse = groupCourse;
    }
}
