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
    public void syncAllExistingAssignments() {
        log.info("Starting sync of all existing assignments to calendar...");
        List<Assignment> allAssignments = assignmentRepository.findAll();
        int createdCount = 0;
        
        for (Assignment assignment : allAssignments) {
            if (assignment.getDueAt() == null) continue;

            List<GroupMember> members = groupMemberRepository.findByGroup_Id(assignment.getGroup().getId());
            
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
        log.info("Sync completed. Created {} new calendar events for assignments.", createdCount);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDiagnostics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_calendar_events", calendarEventRepository.count());
        stats.put("total_assignments", assignmentRepository.count());
        stats.put("assignments_by_type", calendarEventRepository.findAll().stream()
                .filter(ce -> ce.getSourceEntityType() == CalendarEvent.SourceEntityType.ASSIGNMENT)
                .count());
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
