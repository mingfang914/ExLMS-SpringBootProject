package project.TeamFive.ExLMS.calendar.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;
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
        GroupAssignment deployment = event.getDeployment();
        
        log.info("EVENT_DEBUG: Received AssignmentCreatedEvent for deployment ID: {}, Title: {}", 
                deployment.getId(), deployment.getAssignment().getTitle());
        if (deployment.getDueAt() == null) {
            log.warn("EVENT_DEBUG: Deployment dueAt is NULL, skipping calendar sync.");
            return;
        }

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(deployment.getGroup().getId());
        log.info("EVENT_DEBUG: Found {} group members for deployment sync.", members.size());
        
        if (members.isEmpty()) {
            return;
        }

        List<CalendarEvent> calendarEvents = members.stream()
                .map(member -> createCalendarEvent(deployment, member))
                .collect(Collectors.toList());

        calendarEventRepository.saveAll(calendarEvents);
        notifyMembers(members, deployment.getId());
    }

    @EventListener
    @Transactional
    public void onAssignmentUpdated(AssignmentUpdatedEvent event) {
        GroupAssignment deployment = event.getDeployment();
        Assignment template = deployment.getAssignment();
        log.info("Processing AssignmentUpdatedEvent for deployment: {}", deployment.getId());

        List<CalendarEvent> existingEvents = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(
                deployment.getId(), CalendarEvent.SourceEntityType.ASSIGNMENT);

        if (deployment.getDueAt() == null) {
            calendarEventRepository.deleteAll(existingEvents);
        } else {
            for (CalendarEvent calEvent : existingEvents) {
                calEvent.setTitle("Assignment Due: " + template.getTitle());
                calEvent.setDescription(template.getDescription());
                calEvent.setStartAt(deployment.getDueAt());
                calEvent.setEndAt(deployment.getDueAt());
                calEvent.setColor("#EF4444");
            }
            calendarEventRepository.saveAll(existingEvents);
        }

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(deployment.getGroup().getId());
        notifyMembers(members, deployment.getId());
    }

    @EventListener
    @Transactional
    public void onAssignmentDeleted(AssignmentDeletedEvent event) {
        log.info("Processing AssignmentDeletedEvent for deployment: {}", event.getAssignmentId());
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                event.getAssignmentId(), CalendarEvent.SourceEntityType.ASSIGNMENT);
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }

    private CalendarEvent createCalendarEvent(GroupAssignment deployment, GroupMember member) {
        Assignment template = deployment.getAssignment();
        return CalendarEvent.builder()
                .user(member.getUser())
                .title("Assignment Due: " + template.getTitle())
                .description(template.getDescription())
                .startAt(deployment.getDueAt())
                .endAt(deployment.getDueAt())
                .eventType(CalendarEvent.EventType.ASSIGNMENT_DUE)
                .color("#EF4444")
                .sourceEntityId(deployment.getId())
                .sourceEntityType(CalendarEvent.SourceEntityType.ASSIGNMENT)
                .groupId(deployment.getGroup().getId())
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
