package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.CourseQuiz;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseQuizRepository extends JpaRepository<CourseQuiz, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT cq FROM CourseQuiz cq JOIN FETCH cq.quiz WHERE cq.course.id = :courseId ORDER BY cq.orderIndex ASC")
    List<CourseQuiz> findByCourse_Id(@org.springframework.data.repository.query.Param("courseId") java.util.UUID courseId);

    @org.springframework.data.jpa.repository.Query("SELECT cq FROM CourseQuiz cq JOIN FETCH cq.quiz WHERE cq.chapter.id = :chapterId ORDER BY cq.orderIndex ASC")
    List<CourseQuiz> findByChapter_Id(@org.springframework.data.repository.query.Param("chapterId") java.util.UUID chapterId);
}
