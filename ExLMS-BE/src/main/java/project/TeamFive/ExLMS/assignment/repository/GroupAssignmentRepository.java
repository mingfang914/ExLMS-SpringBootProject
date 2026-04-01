package project.TeamFive.ExLMS.assignment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;

import java.util.List;
import java.util.UUID;

import project.TeamFive.ExLMS.assignment.entity.GroupAssignment.GroupAssignmentStatus;
import java.time.LocalDateTime;

@Repository
public interface GroupAssignmentRepository extends JpaRepository<GroupAssignment, UUID> {
    List<GroupAssignment> findByGroup_Id(UUID groupId);
    List<GroupAssignment> findByAssignment_Id(UUID assignmentId);
    List<GroupAssignment> findByStatusAndDueAtBefore(GroupAssignmentStatus status, LocalDateTime now);
    void deleteByAssignment_Id(UUID assignmentId);
}
