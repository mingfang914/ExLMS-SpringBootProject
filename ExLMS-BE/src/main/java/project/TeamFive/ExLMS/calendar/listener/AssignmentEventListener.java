package project.TeamFive.ExLMS.calendar.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.event.AssignmentCreatedEvent;
import project.TeamFive.ExLMS.assignment.event.AssignmentDeletedEvent;
import project.TeamFive.ExLMS.assignment.event.AssignmentUpdatedEvent;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.calendar.repository.CalendarEventRepository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AssignmentEventListener {

    private final CalendarEventRepository calendarEventRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    @Transactional
    public void onAssignmentCreated(AssignmentCreatedEvent event) {
        Assignment assignment = event.getAssignment();
        log.info("EVENT_DEBUG: Received AssignmentCreatedEvent for assignment ID: {}", assignment.getId());
        if (assignment.getDueAt() == null) {
            log.warn("EVENT_DEBUG: Assignment dueAt is NULL, skipping calendar sync.");
            return;
        }

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(assignment.getGroup().getId());
        log.info("EVENT_DEBUG: Found {} group members for assignment sync. Group ID: {}", members.size(), assignment.getGroup().getId());
        
        if (members.isEmpty()) {
            log.warn("EVENT_DEBUG: No members found for group {}, skipping calendar event creation.", assignment.getGroup().getId());
            return;
        }

        List<CalendarEvent> calendarEvents = members.stream()
                .map(member -> {
                    log.info("EVENT_DEBUG: Creating calendar event for user: {}", member.getUser().getId());
                    return createCalendarEvent(assignment, member);
                })
                .collect(Collectors.toList());

        calendarEventRepository.saveAll(calendarEvents);
        log.info("EVENT_DEBUG: Saved {} calendar events for assignment.", calendarEvents.size());
        notifyMembers(members, assignment.getId());
    }

    @EventListener
    @Transactional
    public void onAssignmentUpdated(AssignmentUpdatedEvent event) {
        Assignment assignment = event.getAssignment();
        log.info("Processing AssignmentUpdatedEvent for assignment: {}", assignment.getId());

        // Delete existing and recreate if dueAt changed significantly or just update
        // To be safe and simple, we delete and recreate or update all matches
        List<CalendarEvent> existingEvents = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(
                assignment.getId(), CalendarEvent.SourceEntityType.ASSIGNMENT);

        if (assignment.getDueAt() == null) {
            calendarEventRepository.deleteAll(existingEvents);
        } else {
            for (CalendarEvent calEvent : existingEvents) {
                calEvent.setTitle("Assignment Due: " + assignment.getTitle());
                calEvent.setDescription(assignment.getDescription());
                calEvent.setStartAt(assignment.getDueAt());
                calEvent.setEndAt(assignment.getDueAt());
                calEvent.setColor("#EF4444"); // Red for assignments
            }
            calendarEventRepository.saveAll(existingEvents);
        }

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(assignment.getGroup().getId());
        notifyMembers(members, assignment.getId());
    }

    @EventListener
    @Transactional
    public void onAssignmentDeleted(AssignmentDeletedEvent event) {
        log.info("Processing AssignmentDeletedEvent for assignment: {}", event.getAssignmentId());
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                event.getAssignmentId(), CalendarEvent.SourceEntityType.ASSIGNMENT);
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }

    private CalendarEvent createCalendarEvent(Assignment assignment, GroupMember member) {
        return CalendarEvent.builder()
                .user(member.getUser())
                .title("Assignment Due: " + assignment.getTitle())
                .description(assignment.getDescription())
                .startAt(assignment.getDueAt())
                .endAt(assignment.getDueAt())
                .eventType(CalendarEvent.EventType.ASSIGNMENT_DUE)
                .color("#EF4444")
                .sourceEntityId(assignment.getId())
                .sourceEntityType(CalendarEvent.SourceEntityType.ASSIGNMENT)
                .groupId(assignment.getGroup().getId())
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
