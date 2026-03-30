package project.TeamFive.ExLMS.calendar.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.course.event.CourseCreatedEvent;
import project.TeamFive.ExLMS.course.event.CourseDeletedEvent;
import project.TeamFive.ExLMS.course.event.CourseUpdatedEvent;
import project.TeamFive.ExLMS.calendar.entity.CalendarEvent;
import project.TeamFive.ExLMS.calendar.repository.CalendarEventRepository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseEventListener {

    private final CalendarEventRepository calendarEventRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    @Transactional
    public void onCourseCreated(CourseCreatedEvent event) {
        Course course = event.getCourse();
        log.info("EVENT_DEBUG: Received CourseCreatedEvent for course ID: {}", course.getId());
        log.info("EVENT_DEBUG: Course dates: start={}, end={}", course.getStartDate(), course.getEndDate());

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(course.getGroup().getId());
        log.info("EVENT_DEBUG: Found {} group members for course sync.", members.size());
        List<CalendarEvent> calendarEvents = new ArrayList<>();

        for (GroupMember member : members) {
            if (course.getStartDate() != null) {
                calendarEvents.add(createCalendarEvent(course, member, true));
            }
            if (course.getEndDate() != null) {
                calendarEvents.add(createCalendarEvent(course, member, false));
            }
        }

        calendarEventRepository.saveAll(calendarEvents);
        notifyMembers(members, course.getId());
    }

    @EventListener
    @Transactional
    public void onCourseUpdated(CourseUpdatedEvent event) {
        Course course = event.getCourse();
        log.info("Processing CourseUpdatedEvent for course: {}", course.getId());

        // For simplicity, we delete existing course events and recreate them
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                course.getId(), CalendarEvent.SourceEntityType.COURSE);

        if ("DELETED".equals(course.getStatus())) {
            messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
            return;
        }

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(course.getGroup().getId());
        List<CalendarEvent> calendarEvents = new ArrayList<>();

        for (GroupMember member : members) {
            if (course.getStartDate() != null) {
                calendarEvents.add(createCalendarEvent(course, member, true));
            }
            if (course.getEndDate() != null) {
                calendarEvents.add(createCalendarEvent(course, member, false));
            }
        }

        calendarEventRepository.saveAll(calendarEvents);
        notifyMembers(members, course.getId());
    }

    @EventListener
    @Transactional
    public void onCourseDeleted(CourseDeletedEvent event) {
        log.info("Processing CourseDeletedEvent for course: {}", event.getCourseId());
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                event.getCourseId(), CalendarEvent.SourceEntityType.COURSE);
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }

    private CalendarEvent createCalendarEvent(Course course, GroupMember member, boolean isStart) {
        return CalendarEvent.builder()
                .user(member.getUser())
                .title((isStart ? "Course Start: " : "Course End: ") + course.getTitle())
                .description(course.getDescription())
                .startAt(isStart ? course.getStartDate().atStartOfDay() : course.getEndDate().atStartOfDay())
                .endAt(isStart ? course.getStartDate().atTime(23, 59, 59) : course.getEndDate().atTime(23, 59, 59))
                .eventType(isStart ? CalendarEvent.EventType.COURSE_START : CalendarEvent.EventType.COURSE_END)
                .color("#10B981") // Green for courses
                .sourceEntityId(course.getId())
                .sourceEntityType(CalendarEvent.SourceEntityType.COURSE)
                .groupId(course.getGroup().getId())
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
