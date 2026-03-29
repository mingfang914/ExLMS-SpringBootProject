package project.TeamFive.ExLMS.group.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.group.entity.GroupEvent;

@Getter
public class GroupEventCreatedEvent extends ApplicationEvent {
    private final GroupEvent groupEvent;

    public GroupEventCreatedEvent(Object source, GroupEvent groupEvent) {
        super(source);
        this.groupEvent = groupEvent;
    }
}
