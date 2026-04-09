package project.TeamFive.ExLMS.collab.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.collab.entity.CollabParticipant;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollabParticipantRepository extends JpaRepository<CollabParticipant, UUID> {
    List<CollabParticipant> findByCollabId(UUID collabId);
    Optional<CollabParticipant> findByCollabIdAndUserId(UUID collabId, UUID userId);
    boolean existsByCollabIdAndUserId(UUID collabId, UUID userId);
}
