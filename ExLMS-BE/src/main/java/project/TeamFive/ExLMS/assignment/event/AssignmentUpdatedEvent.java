package project.TeamFive.ExLMS.assignment.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;

@Getter
public class AssignmentUpdatedEvent extends ApplicationEvent {
    private final GroupAssignment deployment;

    public AssignmentUpdatedEvent(Object source, GroupAssignment deployment) {
        super(source);
        this.deployment = deployment;
    }
}
