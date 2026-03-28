package project.TeamFive.ExLMS.assignment.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class AssignmentDeletedEvent extends ApplicationEvent {
    private final UUID assignmentId;

    public AssignmentDeletedEvent(Object source, UUID assignmentId) {
        super(source);
        this.assignmentId = assignmentId;
    }
}
