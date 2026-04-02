package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.UUID;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByCreatedBy_Id(UUID creatorId);
    List<Course> findByCreatedBy(User creator);
}
