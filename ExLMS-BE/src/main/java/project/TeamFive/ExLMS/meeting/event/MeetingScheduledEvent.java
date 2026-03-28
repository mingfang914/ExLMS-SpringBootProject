package project.TeamFive.ExLMS.meeting.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import project.TeamFive.ExLMS.meeting.entity.Meeting;

@Getter
public class MeetingScheduledEvent extends ApplicationEvent {
    private final Meeting meeting;

    public MeetingScheduledEvent(Object source, Meeting meeting) {
        super(source);
        this.meeting = meeting;
    }
}
