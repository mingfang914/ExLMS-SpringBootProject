package project.TeamFive.ExLMS.meeting.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class MeetingCanceledEvent extends ApplicationEvent {
    private final UUID meetingId;

    public MeetingCanceledEvent(Object source, UUID meetingId) {
        super(source);
        this.meetingId = meetingId;
    }
}
