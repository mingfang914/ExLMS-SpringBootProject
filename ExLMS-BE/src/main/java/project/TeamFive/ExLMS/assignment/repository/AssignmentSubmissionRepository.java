package project.TeamFive.ExLMS.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.assignment.entity.AssignmentSubmission;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {
    List<AssignmentSubmission> findByGroupAssignment_Id(UUID groupAssignmentId);
    List<AssignmentSubmission> findByGroupAssignment_IdAndStudent_Id(UUID groupAssignmentId, UUID studentId);
    Optional<AssignmentSubmission> findTopByGroupAssignment_IdAndStudent_IdOrderByAttemptNumberDesc(UUID groupAssignmentId, UUID studentId);
    long countByGroupAssignment_IdAndStudent_Id(UUID groupAssignmentId, UUID studentId);
}
