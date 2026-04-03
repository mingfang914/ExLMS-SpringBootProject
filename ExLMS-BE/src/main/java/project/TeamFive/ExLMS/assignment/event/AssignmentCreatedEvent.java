package project.TeamFive.ExLMS.assignment.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;

@Getter
public class AssignmentCreatedEvent extends ApplicationEvent {
    private final GroupAssignment deployment;

    public AssignmentCreatedEvent(Object source, GroupAssignment deployment) {
        super(source);
        this.deployment = deployment;
    }
}
