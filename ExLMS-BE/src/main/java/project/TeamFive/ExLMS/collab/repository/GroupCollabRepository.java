package project.TeamFive.ExLMS.collab.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.collab.entity.GroupCollab;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupCollabRepository extends JpaRepository<GroupCollab, UUID> {
    List<GroupCollab> findByGroupIdOrderByCreatedAtDesc(UUID groupId);
}
