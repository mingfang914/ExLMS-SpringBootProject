package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.CourseQuiz;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseQuizRepository extends JpaRepository<CourseQuiz, UUID> {
    List<CourseQuiz> findByCourse_Id(UUID courseId);
    List<CourseQuiz> findByChapter_Id(UUID chapterId);
}
