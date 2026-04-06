package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByCreatedBy_IdAndDeletedAtIsNull(UUID creatorId);
    List<Course> findByCreatedByAndDeletedAtIsNull(User creator);
    Optional<Course> findByIdAndDeletedAtIsNull(UUID id);
}
