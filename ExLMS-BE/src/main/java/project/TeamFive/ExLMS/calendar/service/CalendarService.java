package project.TeamFive.ExLMS.calendar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;
import project.TeamFive.ExLMS.assignment.repository.AssignmentRepository;
import project.TeamFive.ExLMS.assignment.repository.GroupAssignmentRepository;
import project.TeamFive.ExLMS.calendar.dto.response.CalendarEventResponse;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.calendar.repository.CalendarEventRepository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final GroupAssignmentRepository groupAssignmentRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional(readOnly = true)
    public List<CalendarEventResponse> getUserEvents(UUID userId, LocalDateTime start, LocalDateTime end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CalendarEvent> events;
        if (start != null && end != null) {
            events = calendarEventRepository.findByUserAndStartAtBetweenOrderByStartAtAsc(user, start, end);
        } else {
            events = calendarEventRepository.findByUserOrderByStartAtAsc(user);
        }

        return events.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public int syncAllExistingAssignments() {
        log.info("CALENDAR_SYNC: Starting sync of all existing assignments to calendar...");
        List<GroupAssignment> allDeployments = groupAssignmentRepository.findAll();
        log.info("CALENDAR_SYNC: Found {} total deployments in database", allDeployments.size());
        int createdCount = 0;
        int skipNoDueDate = 0;
        int skipNoGroup = 0;
        int skipNoMembers = 0;
        
        for (GroupAssignment deployment : allDeployments) {
            Assignment template = deployment.getAssignment();
            String deploymentLabel = "[" + deployment.getId() + ": " + template.getTitle() + "]";
            
            if (deployment.getDueAt() == null) {
                log.info("CALENDAR_SYNC: Skipping {} - No due date", deploymentLabel);
                skipNoDueDate++;
                continue;
            }

            if (deployment.getGroup() == null) {
                log.warn("CALENDAR_SYNC: Skipping {} - Deployment not linked to any group", deploymentLabel);
                skipNoGroup++;
                continue;
            }

            List<GroupMember> members = groupMemberRepository.findByGroup_Id(deployment.getGroup().getId());
            if (members.isEmpty()) {
                log.info("CALENDAR_SYNC: Skipping {} - Group has no members", deploymentLabel);
                skipNoMembers++;
                continue;
            }
            
            for (GroupMember member : members) {
                // Check if already exists for this deployment and user
                List<CalendarEvent> existing = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(
                        deployment.getId(), CalendarEvent.SourceEntityType.ASSIGNMENT);
                
                boolean alreadySyncedForUser = existing.stream()
                        .anyMatch(ce -> ce.getUser().getId().equals(member.getUser().getId()));
                
                if (!alreadySyncedForUser) {
                    CalendarEvent calEvent = CalendarEvent.builder()
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
                    calendarEventRepository.save(calEvent);
                    createdCount++;
                }
            }
        }
        log.info("CALENDAR_SYNC: Finished. Created: {}, Skipped: NoDueDate={}, NoGroup={}, NoMembers={}", 
                createdCount, skipNoDueDate, skipNoGroup, skipNoMembers);
        return createdCount;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDiagnostics(UUID userId) {
        Map<String, Object> stats = new HashMap<>();
        long totalEvents = calendarEventRepository.count();
        long totalDeployments = groupAssignmentRepository.count();
        long totalTemplates = assignmentRepository.count();
        
        stats.put("total_calendar_events", totalEvents);
        stats.put("total_assignment_templates", totalTemplates);
        stats.put("total_assignment_deployments", totalDeployments);
        
        if (userId != null) {
            long userEvents = calendarEventRepository.countByUser_Id(userId);
            stats.put("user_total_events", userEvents);
        }
        
        return stats;
    }

    private CalendarEventResponse mapToResponse(CalendarEvent event) {
        return CalendarEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startAt(event.getStartAt())
                .endAt(event.getEndAt())
                .eventType(event.getEventType())
                .color(event.getColor())
                .sourceEntityId(event.getSourceEntityId())
                .sourceEntityType(event.getSourceEntityType())
                .groupId(event.getGroupId())
                .personal(event.isPersonal())
                .reminderAt(event.getReminderAt())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
