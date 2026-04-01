package project.TeamFive.ExLMS.calendar.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.calendar.repository.CalendarEventRepository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.meeting.entity.Meeting;
import project.TeamFive.ExLMS.meeting.event.MeetingCanceledEvent;
import project.TeamFive.ExLMS.meeting.event.MeetingScheduledEvent;
import project.TeamFive.ExLMS.meeting.event.MeetingUpdatedEvent;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class MeetingEventListener {

    private final CalendarEventRepository calendarEventRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    @Transactional
    public void onMeetingScheduled(MeetingScheduledEvent event) {
        Meeting meeting = event.getMeeting();
        log.info("Processing MeetingScheduledEvent for meeting: {}", meeting.getId());

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(meeting.getGroup().getId());
        
        List<CalendarEvent> calendarEvents = members.stream()
                .map(member -> createCalendarEvent(meeting, member))
                .collect(Collectors.toList());

        calendarEventRepository.saveAll(calendarEvents);
        notifyMembers(members, meeting.getId());
    }

    @EventListener
    @Transactional
    public void onMeetingUpdated(MeetingUpdatedEvent event) {
        Meeting meeting = event.getMeeting();
        log.info("Processing MeetingUpdatedEvent for meeting: {}", meeting.getId());

        List<CalendarEvent> calendarEvents = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(
                meeting.getId(), CalendarEvent.SourceEntityType.MEETING);

        for (CalendarEvent calEvent : calendarEvents) {
            calEvent.setTitle("Meeting: " + meeting.getTitle());
            calEvent.setDescription(meeting.getDescription());
            calEvent.setStartAt(meeting.getStartAt());
            calEvent.setEndAt(meeting.getEndAt());
            calEvent.setColor("#6366F1"); // Blue for meetings
        }

        calendarEventRepository.saveAll(calendarEvents);

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(meeting.getGroup().getId());
        notifyMembers(members, meeting.getId());
    }

    @EventListener
    @Transactional
    public void onMeetingCanceled(MeetingCanceledEvent event) {
        log.info("Processing MeetingCanceledEvent for meeting: {}", event.getMeetingId());
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                event.getMeetingId(), CalendarEvent.SourceEntityType.MEETING);
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }

    private CalendarEvent createCalendarEvent(Meeting meeting, GroupMember member) {
        return CalendarEvent.builder()
                .user(member.getUser())
                .title("Meeting: " + meeting.getTitle())
                .description(meeting.getDescription())
                .startAt(meeting.getStartAt())
                .endAt(meeting.getEndAt())
                .eventType(CalendarEvent.EventType.MEETING)
                .color("#6366F1")
                .sourceEntityId(meeting.getId())
                .sourceEntityType(CalendarEvent.SourceEntityType.MEETING)
                .groupId(meeting.getGroup().getId())
                .personal(false)
                .build();
    }

    private void notifyMembers(List<GroupMember> members, UUID sourceId) {
        for (GroupMember member : members) {
            messagingTemplate.convertAndSendToUser(
                    member.getUser().getId().toString(),
                    "/queue/calendar",
                    "UPDATE:" + sourceId.toString()
            );
        }
    }
}
