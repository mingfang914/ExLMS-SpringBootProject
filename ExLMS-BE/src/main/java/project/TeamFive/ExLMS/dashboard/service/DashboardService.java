package project.TeamFive.ExLMS.dashboard.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.dashboard.dto.response.DashboardStatsResponse;
import project.TeamFive.ExLMS.user.entity.User;

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

        // 2. Courses (Count active deployments in groups the user is a member of)
        long courses = ((Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM group_courses gc " +
                "JOIN group_members gm ON gc.group_id = gm.group_id " +
                "WHERE gm.user_id = UNHEX(REPLACE(:userId, '-', '')) AND gc.status = 'PUBLISHED'")
                .setParameter("userId", user.getId().toString())
                .getSingleResult()).longValue();

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

        return DashboardStatsResponse.builder()
                .joinedGroups(joinedGroups)
                .coursesInProgress(courses)
                .pendingAssignments(pendingAssignments)
                .upcomingMeetings(upcomingMeetings)
                .build();
    }
}
