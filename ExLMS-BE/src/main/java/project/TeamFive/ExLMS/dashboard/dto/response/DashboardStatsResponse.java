package project.TeamFive.ExLMS.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long joinedGroups;
    private long coursesInProgress;
    private long pendingAssignments;
    private long upcomingMeetings;
    private long totalAchievement;
    private double averageCompletion;
    
    // Data for Charts
    private List<Map<String, Object>> weeklyPerformance; // Line Chart (Activity over last 7 days)
    private List<Map<String, Object>> groupCategories; // Pie Chart (Groups by category)
    private List<Map<String, Object>> recentActivities; // Recent activities feed
}
