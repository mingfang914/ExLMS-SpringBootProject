package project.TeamFive.ExLMS.dashboard.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.dashboard.dto.response.DashboardStatsResponse;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.entity.Role;

@Service
@RequiredArgsConstructor
public class DashboardService {

    @PersistenceContext
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getUserStats(User user) {
        
        // 1. Joined Groups
        long joinedGroups = ((Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM group_members WHERE user_id = UNHEX(REPLACE(:userId, '-', ''))")
                .setParameter("userId", user.getId().toString())
                .getSingleResult()).longValue();

        // 2. Courses (Role-aware: Created for Instructor, Enrolled for Student)
        long courses;
        if (user.getRole() == Role.INSTRUCTOR) {
            courses = ((Number) entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM courses WHERE created_by = UNHEX(REPLACE(:userId, '-', ''))")
                    .setParameter("userId", user.getId().toString())
                    .getSingleResult()).longValue();
        } else {
            courses = ((Number) entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM course_enrollments WHERE user_id = UNHEX(REPLACE(:userId, '-', ''))")
                    .setParameter("userId", user.getId().toString())
                    .getSingleResult()).longValue();
        }
        
        // 3. Pending Assignments (Active deployments in user's groups with due_at in future)
        long pendingAssignments = ((Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM group_assignments ga " +
                "JOIN group_members gm ON ga.group_id = gm.group_id " +
                "WHERE gm.user_id = UNHEX(REPLACE(:userId, '-', '')) AND ga.due_at > NOW() AND ga.status = 'PUBLISHED'")
                .setParameter("userId", user.getId().toString())
                .getSingleResult()).longValue();

        // 4. Upcoming Meetings (Meetings in user's groups with start_at in future)
        long upcomingMeetings = ((Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM meetings m " +
                "JOIN group_members gm ON m.group_id = gm.group_id " +
                "WHERE gm.user_id = UNHEX(REPLACE(:userId, '-', '')) AND m.start_at > NOW() AND m.status != 'CANCELLED'")
                .setParameter("userId", user.getId().toString())
                .getSingleResult()).longValue();

        // 5. Total Achievement (Sum of Assignment and Quiz scores)
        long assignmentScore = ((Number) entityManager.createNativeQuery(
                "SELECT COALESCE(SUM(ag.score), 0) FROM assignment_grades ag " +
                "JOIN assignment_submissions asub ON ag.submission_id = asub.id " +
                "WHERE asub.student_id = UNHEX(REPLACE(:userId, '-', ''))")
                .setParameter("userId", user.getId().toString())
                .getSingleResult()).longValue();

        long quizScore = ((Number) entityManager.createNativeQuery(
                "SELECT COALESCE(SUM(score), 0) FROM quiz_attempts " +
                "WHERE user_id = UNHEX(REPLACE(:userId, '-', ''))")
                .setParameter("userId", user.getId().toString())
                .getSingleResult()).longValue();

        // 6. Average Completion
        double averageCompletion = ((Number) entityManager.createNativeQuery(
                "SELECT COALESCE(AVG(progress_percent), 0) FROM course_enrollments " +
                "WHERE user_id = UNHEX(REPLACE(:userId, '-', ''))")
                .setParameter("userId", user.getId().toString())
                .getSingleResult()).doubleValue();

        return DashboardStatsResponse.builder()
                .joinedGroups(joinedGroups)
                .coursesInProgress(courses)
                .pendingAssignments(pendingAssignments)
                .upcomingMeetings(upcomingMeetings)
                .totalAchievement(assignmentScore + quizScore)
                .averageCompletion(averageCompletion)
                .build();
    }
}
