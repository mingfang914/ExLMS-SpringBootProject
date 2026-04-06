package project.TeamFive.ExLMS.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByCreatedByAndDeletedAtIsNull(User creator);
    List<Assignment> findByCreatedBy_IdAndDeletedAtIsNull(UUID creatorId);
    Optional<Assignment> findByIdAndDeletedAtIsNull(UUID id);
}
