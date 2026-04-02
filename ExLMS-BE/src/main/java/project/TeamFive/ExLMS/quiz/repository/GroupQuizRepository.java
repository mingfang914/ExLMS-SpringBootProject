package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.GroupQuiz;

import java.util.List;
import java.util.UUID;

import project.TeamFive.ExLMS.quiz.entity.GroupQuiz.GroupQuizStatus;
import java.time.LocalDateTime;

@Repository
public interface GroupQuizRepository extends JpaRepository<GroupQuiz, UUID> {
    List<GroupQuiz> findByGroup_Id(UUID groupId);
    void deleteByQuiz_Id(UUID quizId);
    List<GroupQuiz> findByStatusAndOpenAtBefore(GroupQuizStatus status, LocalDateTime now);
    List<GroupQuiz> findByStatusAndCloseAtBefore(GroupQuizStatus status, LocalDateTime now);
}
