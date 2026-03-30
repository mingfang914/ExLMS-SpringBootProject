package project.TeamFive.ExLMS.group.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class GroupEventDeletedEvent extends ApplicationEvent {
    private final UUID groupEventId;

    public GroupEventDeletedEvent(Object source, UUID groupEventId) {
        super(source);
        this.groupEventId = groupEventId;
    }
}
