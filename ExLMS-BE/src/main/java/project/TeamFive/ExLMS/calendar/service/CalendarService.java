package project.TeamFive.ExLMS.calendar.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.repository.AssignmentRepository;
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
        List<Assignment> allAssignments = assignmentRepository.findAll();
        log.info("CALENDAR_SYNC: Found {} total assignments in database", allAssignments.size());
        int createdCount = 0;
        int skipNoDueDate = 0;
        int skipNoGroup = 0;
        int skipNoMembers = 0;
        
        for (Assignment assignment : allAssignments) {
            String assignmentLabel = "[" + assignment.getId() + ": " + assignment.getTitle() + "]";
            
            if (assignment.getDueAt() == null) {
                log.info("CALENDAR_SYNC: Skipping {} - No due date", assignmentLabel);
                skipNoDueDate++;
                continue;
            }

            if (assignment.getGroup() == null) {
                log.warn("CALENDAR_SYNC: Skipping {} - Assignment not linked to any group", assignmentLabel);
                skipNoGroup++;
                continue;
            }

            List<GroupMember> members = groupMemberRepository.findByGroup_Id(assignment.getGroup().getId());
            if (members.isEmpty()) {
                log.info("CALENDAR_SYNC: Skipping {} - Group {} has no members", assignmentLabel, assignment.getGroup().getName());
                skipNoMembers++;
                continue;
            }
            
            log.info("CALENDAR_SYNC: Processing {} - Found {} group members", assignmentLabel, members.size());
            
            for (GroupMember member : members) {
                // Check if already exists to avoid duplicates
                List<CalendarEvent> existing = calendarEventRepository.findBySourceEntityIdAndSourceEntityType(
                        assignment.getId(), CalendarEvent.SourceEntityType.ASSIGNMENT);
                
                boolean alreadySyncedForUser = existing.stream()
                        .anyMatch(ce -> ce.getUser().getId().equals(member.getUser().getId()));
                
                if (!alreadySyncedForUser) {
                    CalendarEvent calEvent = CalendarEvent.builder()
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
                    calendarEventRepository.save(calEvent);
                    createdCount++;
                }
            }
        }
        log.info("CALENDAR_SYNC: Sync completed. Created: {}, Skipped (No Due Date: {}, No Group: {}, No Members: {})", 
                createdCount, skipNoDueDate, skipNoGroup, skipNoMembers);
        return createdCount;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDiagnostics(UUID userId) {
        Map<String, Object> stats = new HashMap<>();
        long totalEvents = calendarEventRepository.count();
        long totalAssignments = assignmentRepository.count();
        
        List<CalendarEvent> allEvents = calendarEventRepository.findAll();
        
        long syncedAssignments = allEvents.stream()
                .filter(ce -> ce.getSourceEntityType() == CalendarEvent.SourceEntityType.ASSIGNMENT)
                .map(CalendarEvent::getSourceEntityId)
                .distinct()
                .count();
                
        stats.put("total_calendar_events", totalEvents);
        stats.put("total_assignments", totalAssignments);
        stats.put("synced_distinct_assignments", syncedAssignments);
        stats.put("unsynced_assignments", Math.max(0, totalAssignments - syncedAssignments));
        
        if (userId != null) {
            long userEvents = allEvents.stream()
                    .filter(ce -> ce.getUser().getId().equals(userId))
                    .count();
            long userAssignments = allEvents.stream()
                    .filter(ce -> ce.getUser().getId().equals(userId) && ce.getSourceEntityType() == CalendarEvent.SourceEntityType.ASSIGNMENT)
                    .count();
            stats.put("user_total_events", userEvents);
            stats.put("user_assignment_events", userAssignments);
            
            List<GroupMember> userMemberships = groupMemberRepository.findAllByUserId(userId.toString());
            stats.put("user_group_count", userMemberships.size());
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
