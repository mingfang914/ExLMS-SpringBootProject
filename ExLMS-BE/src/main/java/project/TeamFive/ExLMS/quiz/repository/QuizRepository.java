package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.Quiz;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCreatedByAndDeletedAtIsNull(User creator);
    List<Quiz> findByCreatedBy_IdAndDeletedAtIsNull(UUID creatorId);
    Optional<Quiz> findByIdAndDeletedAtIsNull(UUID id);
}
