package project.TeamFive.ExLMS.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;
import project.TeamFive.ExLMS.assignment.repository.GroupAssignmentRepository;
import project.TeamFive.ExLMS.course.entity.GroupCourse;
import project.TeamFive.ExLMS.course.repository.GroupCourseRepository;
import project.TeamFive.ExLMS.meeting.entity.Meeting;
import project.TeamFive.ExLMS.meeting.repository.MeetingRepository;
import project.TeamFive.ExLMS.quiz.entity.GroupQuiz;
import project.TeamFive.ExLMS.quiz.repository.GroupQuizRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSchedulerService {

    private final MeetingRepository meetingRepository;
    private final GroupAssignmentRepository groupAssignmentRepository;
    private final GroupQuizRepository groupQuizRepository;
    private final GroupCourseRepository groupCourseRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Runs every minute to update statuses of meetings, assignments, and quizzes.
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processRealtimeUpdates() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();
        log.info("SystemScheduler: Starting periodic status update check at {}", now);

        processMeetings(now);
        processAssignments(now);
        processQuizzes(now);
        processGroupCourses(today);
    }

    private void processGroupCourses(LocalDate today) {
        // Close published courses that reach endDate
        List<GroupCourse> toClose = groupCourseRepository.findByStatusAndEndDateBefore(
                GroupCourse.GroupCourseStatus.PUBLISHED, today);

        for (GroupCourse gc : toClose) {
            log.info("SystemScheduler: Closing course '{}' (ID: {})", gc.getCourse().getTitle(), gc.getId());
            gc.setStatus(GroupCourse.GroupCourseStatus.CLOSED);
            groupCourseRepository.save(gc);
            broadcastStatusUpdate(gc.getId(), "COURSE", "CLOSED");
        }
    }

    private void processMeetings(LocalDateTime now) {
        // Start scheduled meetings
        List<Meeting> toStart = meetingRepository.findByStatusAndStartAtBefore(
                Meeting.MeetingStatus.SCHEDULED, now);
        
        for (Meeting meeting : toStart) {
            log.info("SystemScheduler: Starting meeting '{}' (ID: {})", meeting.getTitle(), meeting.getId());
            meeting.setStatus(Meeting.MeetingStatus.LIVE);
            meetingRepository.save(meeting);
            broadcast(meeting.getId(), "MEETING_STARTED", null);
        }

        // End live meetings
        List<Meeting> toEnd = meetingRepository.findByStatusAndEndAtBefore(
                Meeting.MeetingStatus.LIVE, now);

        for (Meeting meeting : toEnd) {
            log.info("SystemScheduler: Ending meeting '{}' (ID: {})", meeting.getTitle(), meeting.getId());
            meeting.setStatus(Meeting.MeetingStatus.ENDED);
            meetingRepository.save(meeting);
            broadcast(meeting.getId(), "MEETING_ENDED", null);
        }
    }

    private void processAssignments(LocalDateTime now) {
        // 1. Open draft assignments
        List<GroupAssignment> toOpen = groupAssignmentRepository.findByStatusAndAssignedAtBefore(
                GroupAssignment.GroupAssignmentStatus.DRAFT, now);
        for (GroupAssignment ga : toOpen) {
            log.info("SystemScheduler: Publishing assignment (ID: {})", ga.getId());
            ga.setStatus(GroupAssignment.GroupAssignmentStatus.PUBLISHED);
            groupAssignmentRepository.save(ga);
            broadcastStatusUpdate(ga.getId(), "ASSIGNMENT", "PUBLISHED");
        }

        // 2. Close published assignments that reached dueAt
        List<GroupAssignment> toClose = groupAssignmentRepository.findByStatusAndDueAtBefore(
                GroupAssignment.GroupAssignmentStatus.PUBLISHED, now);

        for (GroupAssignment assignment : toClose) {
            log.info("SystemScheduler: Closing assignment (ID: {})", assignment.getId());
            assignment.setStatus(GroupAssignment.GroupAssignmentStatus.CLOSED);
            groupAssignmentRepository.save(assignment);
            broadcastStatusUpdate(assignment.getId(), "ASSIGNMENT", "CLOSED");
        }
    }

    private void processQuizzes(LocalDateTime now) {
        // 1. Open draft quizzes that reached openAt
        List<GroupQuiz> toOpen = groupQuizRepository.findByStatusAndOpenAtBefore(
                GroupQuiz.GroupQuizStatus.DRAFT, now);
        
        for (GroupQuiz quiz : toOpen) {
            log.info("SystemScheduler: Opening quiz (ID: {})", quiz.getId());
            quiz.setStatus(GroupQuiz.GroupQuizStatus.PUBLISHED);
            groupQuizRepository.save(quiz);
            broadcastStatusUpdate(quiz.getId(), "QUIZ", "PUBLISHED");
        }

        // 2. Close quizzes that reached closeAt
        List<GroupQuiz> toClose = groupQuizRepository.findByStatusAndCloseAtBefore(
                GroupQuiz.GroupQuizStatus.PUBLISHED, now);
        
        for (GroupQuiz quiz : toClose) {
            log.info("SystemScheduler: Closing quiz (ID: {})", quiz.getId());
            quiz.setStatus(GroupQuiz.GroupQuizStatus.CLOSED);
            groupQuizRepository.save(quiz);
            broadcastStatusUpdate(quiz.getId(), "QUIZ", "CLOSED");
        }
    }

    private void broadcastStatusUpdate(UUID resourceId, String resourceType, String status) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", resourceId);
        data.put("type", resourceType);
        data.put("status", status);
        broadcast(resourceId, "STATUS_CHANGED", data);
        notifyCalendarRefresh();
    }

    private void broadcast(UUID id, String type, Object data) {
        messagingTemplate.convertAndSend("/topic/resource-status", Map.of("type", type, "data", data));
    }

    private void notifyCalendarRefresh() {
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }
}
