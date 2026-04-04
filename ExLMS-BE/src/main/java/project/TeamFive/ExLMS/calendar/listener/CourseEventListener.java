package project.TeamFive.ExLMS.calendar.listener;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.course.entity.GroupCourse;
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
        GroupCourse deployment = event.getGroupCourse();
        log.info("EVENT_DEBUG: Received CourseCreatedEvent for course deployment ID: {}", deployment.getId());
        log.info("EVENT_DEBUG: Course dates: start={}, end={}", deployment.getStartDate(), deployment.getEndDate());

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(deployment.getGroup().getId());
        log.info("EVENT_DEBUG: Found {} group members for course sync.", members.size());
        List<CalendarEvent> calendarEvents = new ArrayList<>();

        for (GroupMember member : members) {
            if (deployment.getStartDate() != null) {
                calendarEvents.add(createCalendarEvent(deployment, member, true));
            }
            if (deployment.getEndDate() != null) {
                calendarEvents.add(createCalendarEvent(deployment, member, false));
            }
        }

        calendarEventRepository.saveAll(calendarEvents);
        notifyMembers(members, deployment.getId());
    }

    @EventListener
    @Transactional
    public void onCourseUpdated(CourseUpdatedEvent event) {
        GroupCourse deployment = event.getGroupCourse();
        log.info("Processing CourseUpdatedEvent for course deployment: {}", deployment.getId());

        // For simplicity, we delete existing course events and recreate them
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                deployment.getId(), CalendarEvent.SourceEntityType.COURSE);

        List<GroupMember> members = groupMemberRepository.findByGroup_Id(deployment.getGroup().getId());
        List<CalendarEvent> calendarEvents = new ArrayList<>();

        for (GroupMember member : members) {
            if (deployment.getStartDate() != null) {
                calendarEvents.add(createCalendarEvent(deployment, member, true));
            }
            if (deployment.getEndDate() != null) {
                calendarEvents.add(createCalendarEvent(deployment, member, false));
            }
        }

        calendarEventRepository.saveAll(calendarEvents);
        notifyMembers(members, deployment.getId());
    }

    @EventListener
    @Transactional
    public void onCourseDeleted(CourseDeletedEvent event) {
        log.info("Processing CourseDeletedEvent for course deployment: {}", event.getCourseId());
        calendarEventRepository.deleteBySourceEntityIdAndSourceEntityType(
                event.getCourseId(), CalendarEvent.SourceEntityType.COURSE);
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }

    private CalendarEvent createCalendarEvent(GroupCourse deployment, GroupMember member, boolean isStart) {
        Course template = deployment.getCourse();
        return CalendarEvent.builder()
                .user(member.getUser())
                .title((isStart ? "Course Start: " : "Course End: ") + template.getTitle())
                .description(template.getDescription())
                .startAt(isStart ? deployment.getStartDate().toLocalDate().atStartOfDay() : deployment.getEndDate().toLocalDate().atStartOfDay())
                .endAt(isStart ? deployment.getStartDate().toLocalDate().atTime(23, 59, 59) : deployment.getEndDate().toLocalDate().atTime(23, 59, 59))
                .eventType(isStart ? CalendarEvent.EventType.COURSE_START : CalendarEvent.EventType.COURSE_END)
                .color("#10B981") // Green for courses
                .sourceEntityId(deployment.getId())
                .sourceEntityType(CalendarEvent.SourceEntityType.COURSE)
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
