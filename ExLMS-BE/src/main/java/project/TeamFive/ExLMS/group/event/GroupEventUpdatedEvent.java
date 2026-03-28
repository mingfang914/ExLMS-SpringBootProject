package project.TeamFive.ExLMS.group.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.group.entity.GroupEvent;

@Getter
public class GroupEventUpdatedEvent extends ApplicationEvent {
    private final GroupEvent groupEvent;

    public GroupEventUpdatedEvent(Object source, GroupEvent groupEvent) {
        super(source);
        this.groupEvent = groupEvent;
    }
}
