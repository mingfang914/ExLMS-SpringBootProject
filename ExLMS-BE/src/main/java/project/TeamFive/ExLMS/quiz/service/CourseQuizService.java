package project.TeamFive.ExLMS.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.course.repository.CourseRepository;
import project.TeamFive.ExLMS.quiz.entity.Quiz;
import project.TeamFive.ExLMS.quiz.repository.QuizRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseQuizService {

    // private final CourseQuizRepository courseQuizRepository; // Deprecated
    private final CourseRepository courseRepository;
    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public List<Quiz> getQuizzesByCourseId(UUID courseId) {
        // Feature removed by user request
        return java.util.Collections.emptyList();
    }

    @Transactional
    public void associateQuizzes(UUID courseId, List<UUID> quizIds) {
        // Feature removed by user request
    }
}
