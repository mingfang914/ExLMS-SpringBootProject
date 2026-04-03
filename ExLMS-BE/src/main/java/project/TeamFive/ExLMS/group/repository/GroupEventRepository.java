package project.TeamFive.ExLMS.group.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.group.entity.GroupEvent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroupEventRepository extends JpaRepository<GroupEvent, UUID> {
    List<GroupEvent> findByGroupIdOrderByStartAtAsc(UUID groupId);
    List<GroupEvent> findByGroupIdAndStartAtBetweenOrderByStartAtAsc(UUID groupId, LocalDateTime start, LocalDateTime end);
}
