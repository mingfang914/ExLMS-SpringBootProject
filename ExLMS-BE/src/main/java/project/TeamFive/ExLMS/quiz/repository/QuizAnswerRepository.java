package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.QuizAnswer;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, UUID> {
    void deleteByQuestion_Id(UUID questionId);
    List<QuizAnswer> findByQuestion_IdOrderByOrderIndexAsc(UUID questionId);
}
