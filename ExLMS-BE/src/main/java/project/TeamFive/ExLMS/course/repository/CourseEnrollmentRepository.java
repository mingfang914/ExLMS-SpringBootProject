package project.TeamFive.ExLMS.course.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.course.entity.CourseEnrollment;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {

    @EntityGraph(attributePaths = {"groupCourse", "user"})
    Optional<CourseEnrollment> findByGroupCourse_IdAndUser_Id(UUID groupCourseId, UUID userId);

    boolean existsByGroupCourse_IdAndUser_Id(UUID groupCourseId, UUID userId);
}
