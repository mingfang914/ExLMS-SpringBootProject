package project.TeamFive.ExLMS.calendar.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.calendar.repository.CalendarEventRepository;
import project.TeamFive.ExLMS.group.entity.GroupEvent;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.event.GroupEventCreatedEvent;
import project.TeamFive.ExLMS.group.event.GroupEventDeletedEvent;
import project.TeamFive.ExLMS.group.event.GroupEventUpdatedEvent;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupEventListener {

    private final CalendarEventRepository calendarEventRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    @Transactional
    public void onGroupEventCreated(GroupEventCreatedEvent event) {
        GroupEvent groupEvent = event.getGroupEvent();
        log.info("Processing GroupEventCreatedEvent for group event: {}", groupEvent.getId());

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(groupEvent.getGroup().getId());
        
        List<CalendarEvent> calendarEvents = members.stream()
                .map(member -> createCalendarEventFromGroupEvent(groupEvent, member))
                .collect(Collectors.toList());

        calendarEventRepository.saveAll(calendarEvents);

        notifyMembers(members, groupEvent.getId());
    }

    @EventListener
    @Transactional
    public void onGroupEventUpdated(GroupEventUpdatedEvent event) {
        GroupEvent groupEvent = event.getGroupEvent();
        log.info("Processing GroupEventUpdatedEvent for group event: {}", groupEvent.getId());

        List<CalendarEvent> calendarEvents = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(
                groupEvent.getId(), CalendarEvent.SourceEntityType.GROUP_EVENT);

        for (CalendarEvent calEvent : calendarEvents) {
            calEvent.setTitle(groupEvent.getTitle());
            calEvent.setDescription(groupEvent.getDescription());
            calEvent.setStartAt(groupEvent.getStartAt());
            calEvent.setEndAt(groupEvent.getEndAt());
            calEvent.setColor(groupEvent.getColor());
            // Location could be added to description or handled separately if CalendarEvent had location
        }

        calendarEventRepository.saveAll(calendarEvents);

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(groupEvent.getGroup().getId());
        notifyMembers(members, groupEvent.getId());
    }

    @EventListener
    @Transactional
    public void onGroupEventDeleted(GroupEventDeletedEvent event) {
        log.info("Processing GroupEventDeletedEvent for group event: {}", event.getGroupEventId());
        
        // Cần lấy ra group để notify trước khi xoá (nếu cần thiết, tuỳ thiết kế)
        // Hiện tại ta chỉ notify refresh
        
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                event.getGroupEventId(), CalendarEvent.SourceEntityType.GROUP_EVENT);

        // Notify tất cả user có sự kiện này bị xoá qua websocket
        // Để đơn giản, ta có thể broadcast một event "refresh calendar"
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }

    private CalendarEvent createCalendarEventFromGroupEvent(GroupEvent groupEvent, GroupMember member) {
        String description = groupEvent.getDescription();
        if (groupEvent.getLocation() != null && !groupEvent.getLocation().isEmpty()) {
            description = "Location: " + groupEvent.getLocation() + "\n\n" + (description != null ? description : "");
        }

        return CalendarEvent.builder()
                .user(member.getUser())
                .title(groupEvent.getTitle())
                .description(description)
                .startAt(groupEvent.getStartAt())
                .endAt(groupEvent.getEndAt())
                .eventType(CalendarEvent.EventType.GROUP_EVENT)
                .color(groupEvent.getColor())
                .sourceEntityId(groupEvent.getId())
                .sourceEntityType(CalendarEvent.SourceEntityType.GROUP_EVENT)
                .groupId(groupEvent.getGroup().getId())
                .personal(false)
                .build();
    }

    private void notifyMembers(List<GroupMember> members, java.util.UUID sourceId) {
        for (GroupMember member : members) {
            messagingTemplate.convertAndSendToUser(
                    member.getUser().getId().toString(),
                    "/queue/calendar",
                    "UPDATE:" + sourceId.toString()
            );
        }
    }
}
