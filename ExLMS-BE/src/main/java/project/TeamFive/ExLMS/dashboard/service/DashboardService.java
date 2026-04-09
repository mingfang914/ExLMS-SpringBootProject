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
    @SuppressWarnings("unchecked")
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

        // Thêm cho Biểu đồ
        // 7. Weekly Performance (Mock or Real counts for last 7 days)
        java.util.List<java.util.Map<String, Object>> weekly = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
            long dayCount = ((Number) entityManager.createNativeQuery(
                    "SELECT (SELECT COUNT(*) FROM assignment_submissions WHERE student_id = UNHEX(REPLACE(:userId, '-', '')) AND DATE(submitted_at) = :date) + " +
                    "(SELECT COUNT(*) FROM quiz_attempts WHERE user_id = UNHEX(REPLACE(:userId, '-', '')) AND DATE(created_at) = :date)")
                    .setParameter("userId", user.getId().toString())
                    .setParameter("date", date)
                    .getSingleResult()).longValue();
            
            java.util.Map<String, Object> dayData = new java.util.HashMap<>();
            dayData.put("name", date.getDayOfWeek().toString().substring(0, 3));
            dayData.put("value", dayCount);
            weekly.add(dayData);
        }

        // 8. Group Categories Distribution
        java.util.List<Object[]> categoryCounts = entityManager.createNativeQuery(
                "SELECT g.category, COUNT(*) FROM study_groups g " +
                "JOIN group_members gm ON g.id = gm.group_id " +
                "WHERE gm.user_id = UNHEX(REPLACE(:userId, '-', '')) " +
                "GROUP BY g.category")
                .setParameter("userId", user.getId().toString())
                .getResultList();
        
        java.util.List<java.util.Map<String, Object>> categories = categoryCounts.stream()
                .map(row -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("name", row[0] != null ? row[0] : "Khác");
                    map.put("value", ((Number) row[1]).longValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());

        // 9. Recent Activities (Mock)
        java.util.List<java.util.Map<String, Object>> recent = new java.util.ArrayList<>();
        // Mock data for UI demonstration to wow user
        String[] titles = {"Hoàn thành Bài tập SQL", "Tham gia Nhóm ReactJS", "Gia nhập khóa học Node.js", "Cập nhật ảnh đại diện", "Bình luận trong Forum"};
        for (int i = 0; i < 4; i++) {
            java.util.Map<String, Object> act = new java.util.HashMap<>();
            act.put("id", i);
            act.put("title", titles[i]);
            act.put("time", (i * 2 + 1) + " giờ trước");
            act.put("type", i % 2 == 0 ? "SUCCESS" : "INFO");
            recent.add(act);
        }

        return DashboardStatsResponse.builder()
                .joinedGroups(joinedGroups)
                .coursesInProgress(courses)
                .pendingAssignments(pendingAssignments)
                .upcomingMeetings(upcomingMeetings)
                .totalAchievement(assignmentScore + quizScore)
                .averageCompletion(averageCompletion)
                .weeklyPerformance(weekly)
                .groupCategories(categories)
                .recentActivities(recent)
                .build();
    }
}
