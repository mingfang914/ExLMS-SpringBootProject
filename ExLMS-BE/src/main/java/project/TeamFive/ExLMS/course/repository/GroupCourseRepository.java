package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.GroupCourse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroupCourseRepository extends JpaRepository<GroupCourse, UUID> {
    List<GroupCourse> findByGroup_Id(UUID groupId);
    List<GroupCourse> findByCourse_Id(UUID courseId);
    
    List<GroupCourse> findByStatusAndStartDateBefore(GroupCourse.GroupCourseStatus status, LocalDateTime now);
    List<GroupCourse> findByStatusAndEndDateBefore(GroupCourse.GroupCourseStatus status, LocalDateTime now);
}
