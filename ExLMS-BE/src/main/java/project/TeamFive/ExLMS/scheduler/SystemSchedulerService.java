package project.TeamFive.ExLMS.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;
import project.TeamFive.ExLMS.assignment.repository.GroupAssignmentRepository;
import project.TeamFive.ExLMS.meeting.entity.Meeting;
import project.TeamFive.ExLMS.meeting.repository.MeetingRepository;
import project.TeamFive.ExLMS.quiz.entity.GroupQuiz;
import project.TeamFive.ExLMS.quiz.repository.GroupQuizRepository;

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
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Runs every minute to update statuses of meetings, assignments, and quizzes.
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processRealtimeUpdates() {
        LocalDateTime now = LocalDateTime.now();
        log.info("SystemScheduler: Starting periodic status update check at {}", now);

        processMeetings(now);
        processAssignments(now);
        processQuizzes(now);
    }

    private void processMeetings(LocalDateTime now) {
        // 1. Start scheduled meetings
        List<Meeting> toStart = meetingRepository.findByStatusAndStartAtBefore(
                Meeting.MeetingStatus.SCHEDULED, now);
        
        for (Meeting meeting : toStart) {
            log.info("SystemScheduler: Starting meeting '{}' (ID: {})", meeting.getTitle(), meeting.getId());
            meeting.setStatus(Meeting.MeetingStatus.LIVE);
            meetingRepository.save(meeting);
            broadcast(meeting.getId(), "MEETING_STARTED", null);
        }

        // 2. End live meetings
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
        // Close published assignments that reached dueAt (and don't allow late)
        List<GroupAssignment> toClose = groupAssignmentRepository.findByStatusAndDueAtBefore(
                GroupAssignment.GroupAssignmentStatus.PUBLISHED, now);

        for (GroupAssignment assignment : toClose) {
            if (!assignment.isAllowLate()) {
                log.info("SystemScheduler: Closing assignment '{}' (ID: {})", 
                        assignment.getAssignment().getTitle(), assignment.getId());
                assignment.setStatus(GroupAssignment.GroupAssignmentStatus.CLOSED);
                groupAssignmentRepository.save(assignment);
                notifyCalendarUpdate();
            }
        }
    }

    private void processQuizzes(LocalDateTime now) {
        // 1. Open quizzes that reached openAt
        List<GroupQuiz> toOpen = groupQuizRepository.findByStatusAndOpenAtBefore(
                GroupQuiz.GroupQuizStatus.DRAFT, now);
        
        for (GroupQuiz quiz : toOpen) {
            log.info("SystemScheduler: Opening quiz (ID: {})", quiz.getId());
            quiz.setStatus(GroupQuiz.GroupQuizStatus.PUBLISHED);
            groupQuizRepository.save(quiz);
            notifyCalendarUpdate();
        }

        // 2. Close quizzes that reached closeAt
        List<GroupQuiz> toClose = groupQuizRepository.findByStatusAndCloseAtBefore(
                GroupQuiz.GroupQuizStatus.PUBLISHED, now);
        
        for (GroupQuiz quiz : toClose) {
            log.info("SystemScheduler: Closing quiz (ID: {})", quiz.getId());
            quiz.setStatus(GroupQuiz.GroupQuizStatus.CLOSED);
            groupQuizRepository.save(quiz);
            notifyCalendarUpdate();
        }
    }

    private void broadcast(UUID meetingId, String type, Object data) {
        String destination = "/topic/meeting/" + meetingId;
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("data", data);
        messagingTemplate.convertAndSend(destination, payload);
        notifyCalendarUpdate();
    }

    private void notifyCalendarUpdate() {
        messagingTemplate.convertAndSend("/topic/calendar-updates", "REFRESH");
    }
}
