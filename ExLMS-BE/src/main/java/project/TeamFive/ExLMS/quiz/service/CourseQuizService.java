package project.TeamFive.ExLMS.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.quiz.entity.Quiz;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseQuizService {

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
