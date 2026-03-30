package project.TeamFive.ExLMS.assignment.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.assignment.entity.Assignment;

@Getter
public class AssignmentUpdatedEvent extends ApplicationEvent {
    private final Assignment assignment;

    public AssignmentUpdatedEvent(Object source, Assignment assignment) {
        super(source);
        this.assignment = assignment;
    }
}
