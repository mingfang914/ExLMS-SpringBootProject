package project.TeamFive.ExLMS.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.quiz.dto.request.QuizAttemptRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizAttemptResponse;
import project.TeamFive.ExLMS.quiz.entity.*;
import project.TeamFive.ExLMS.quiz.repository.*;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.nio.ByteBuffer;

import project.TeamFive.ExLMS.quiz.dto.response.QuizStatsResponse;
import java.util.Map;
import java.util.HashMap;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizResponseRepository responseRepository;
    private final GroupQuizRepository groupQuizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;

    private byte[] uuidToBytes(UUID uuid) {
        if (uuid == null) return null;
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }

    @Transactional
    public QuizAttemptResponse startAttempt(UUID deploymentId, String type, User user) {
        Quiz quiz;
        QuizAttempt.DeploymentType deploymentType;

        if ("GROUP_QUIZ".equals(type)) {
            GroupQuiz gq = groupQuizRepository.findById(deploymentId)
                    .orElseThrow(() -> new RuntimeException("Group Quiz not found"));
            
            if (gq.getStatus() != GroupQuiz.GroupQuizStatus.PUBLISHED) {
                throw new RuntimeException("Bài kiểm tra hiện không ở trạng thái mở để làm bài!");
            }
            
            quiz = gq.getQuiz();
            deploymentType = QuizAttempt.DeploymentType.GROUP_QUIZ;
        } else {
            // Assume it's a COURSE_QUIZ association directly or template fetch
            quiz = quizRepository.findById(deploymentId)
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));
            deploymentType = QuizAttempt.DeploymentType.COURSE_QUIZ;
        }

        // Check max attempts
        long count = attemptRepository.countByQuiz_IdAndUser_IdAndSubmittedAtIsNotNull(quiz.getId(), user.getId());
        if (quiz.getMaxAttempts() > 0 && count >= quiz.getMaxAttempts()) {
            throw new RuntimeException("Bạn đã hết số lần làm bài cho trắc nghiệm này!");
        }

        int currentAttempt = (int) attemptRepository.countByQuiz_IdAndUser_Id(quiz.getId(), user.getId()) + 1;

        QuizAttempt attempt = QuizAttempt.builder()
                .deploymentId(uuidToBytes(deploymentId))
                .deploymentType(deploymentType)
                .quiz(quiz)
                .user(user)
                .attemptNumber(currentAttempt)
                .startedAt(LocalDateTime.now())
                .build();

        return mapToResponse(attemptRepository.save(attempt));
    }

    @Transactional
    public QuizAttemptResponse submitAttempt(UUID attemptId, QuizAttemptRequest request) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lượt làm bài!"));

        if (attempt.getSubmittedAt() != null) {
            throw new RuntimeException("Lượt làm bài này đã được nộp!");
        }

        Quiz quiz = attempt.getQuiz();
        List<QuizQuestion> questions = questionRepository.findByQuizId(quiz.getId());
        int earnedPoints = 0;
        int totalWeight = questions.stream().mapToInt(QuizQuestion::getPoints).sum();
        List<QuizResponse> responses = new ArrayList<>();

        for (QuizQuestion question : questions) {
            QuizAttemptRequest.QuestionAnswerRequest userAns = request.getAnswers().stream()
                    .filter(a -> a.getQuestionId().equals(question.getId()))
                    .findFirst()
                    .orElse(null);

            QuizResponse responseTemplate = QuizResponse.builder()
                    .attempt(attempt)
                    .question(question)
                    .pointsEarned(0)
                    .correct(false)
                    .build();

            if (userAns != null) {
                switch (question.getQuestionType()) {
                    case SINGLE_CHOICE:
                    case TRUE_FALSE:
                        if (userAns.getSelectedAnswerId() != null) {
                            QuizAnswer qa = answerRepository.findById(userAns.getSelectedAnswerId()).orElse(null);
                            responseTemplate.setSelectedAnswer(qa);
                            if (qa != null && qa.isCorrect()) {
                                responseTemplate.setCorrect(true);
                                responseTemplate.setPointsEarned(question.getPoints());
                                earnedPoints += question.getPoints();
                            }
                        }
                        responses.add(responseRepository.save(responseTemplate));
                        break;

                    case MULTIPLE_CHOICE:
                        List<QuizAnswer> correctAnswers = answerRepository.findByQuestion_IdOrderByOrderIndexAsc(question.getId())
                                .stream().filter(QuizAnswer::isCorrect).collect(Collectors.toList());
                        List<UUID> correctAnswerIds = correctAnswers.stream().map(QuizAnswer::getId).collect(Collectors.toList());
                        
                        List<UUID> userSelectedIds = userAns.getSelectedAnswerIds();
                        boolean isCorrect = false;
                        if (userSelectedIds != null && !userSelectedIds.isEmpty()) {
                            isCorrect = userSelectedIds.size() == correctAnswerIds.size() && 
                                               userSelectedIds.containsAll(correctAnswerIds);
                            
                            if (isCorrect) {
                                responseTemplate.setCorrect(true);
                                responseTemplate.setPointsEarned(question.getPoints());
                                earnedPoints += question.getPoints();
                            }

                            // Store multiple answers as a single QuizResponse entry with joined text for simple display
                            // Or handle multiple entries but mark them correctly. 
                            // The current logic creates one entry per selected answer.
                            // Let's modify to save only ONE responseTemplate for MULTIPLE_CHOICE to avoid duplicates in result view.
                            String selectedAnswersText = userSelectedIds.stream()
                                    .map(id -> answerRepository.findById(id).map(QuizAnswer::getContent).orElse(""))
                                    .collect(Collectors.joining(", "));
                            responseTemplate.setTextResponse(selectedAnswersText);
                            responseTemplate.setCorrect(isCorrect);
                            responseTemplate.setPointsEarned(isCorrect ? question.getPoints() : 0);
                        }
                        responses.add(responseRepository.save(responseTemplate));
                        break;

                    case FILL_BLANK:
                        List<QuizAnswer> fillBlankAnswers = answerRepository.findByQuestion_IdOrderByOrderIndexAsc(question.getId());
                        boolean isTextCorrect = false;
                        if (userAns.getTextResponse() != null && !userAns.getTextResponse().trim().isEmpty()) {
                            String userText = userAns.getTextResponse().trim().toLowerCase();
                            isTextCorrect = fillBlankAnswers.stream().anyMatch(a -> a.getContent().trim().toLowerCase().equals(userText));
                            
                            responseTemplate.setTextResponse(userAns.getTextResponse());
                            if (isTextCorrect) {
                                responseTemplate.setCorrect(true);
                                responseTemplate.setPointsEarned(question.getPoints());
                                earnedPoints += question.getPoints();
                            }
                        }
                        responses.add(responseRepository.save(responseTemplate));
                        break;
                    default:
                        // Handle other types if needed
                        responses.add(responseRepository.save(responseTemplate));
                        break;
                }
            } else {
                responses.add(responseRepository.save(responseTemplate));
            }
        }

        double finalScorePercent = totalWeight > 0 ? (double) earnedPoints / totalWeight * 100 : 0;
        attempt.setScore((int) Math.round(finalScorePercent));
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setPassed(attempt.getScore() >= quiz.getPassingScore());
        
        return mapToResponse(attemptRepository.save(attempt));
    }

    @Transactional(readOnly = true)
    public QuizAttemptResponse getAttemptResult(UUID attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
        return mapToResponse(attempt);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getMyAttempts(UUID quizDeploymentId, User user) {
        // Since we don't have unique quizDeploymentId in attempt table easily without byte comparison,
        // we'll fetch by quizId which is usually enough for "My Attempts" in a specific quiz.
        // Actually we can get the quiz from deployment first.
        
        GroupQuiz gq = groupQuizRepository.findById(quizDeploymentId).orElse(null);
        UUID quizId = (gq != null) ? gq.getQuiz().getId() : quizDeploymentId;

        return attemptRepository.findByQuiz_IdAndUser_Id(quizId, user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getAttemptsByDeployment(UUID deploymentId, String type) {
        // Find by deploymentId (as byte[])
        byte[] depIdBytes = uuidToBytes(deploymentId);
        QuizAttempt.DeploymentType depType = QuizAttempt.DeploymentType.valueOf(type);
        
        return attemptRepository.findByDeploymentIdAndDeploymentType(depIdBytes, depType).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizStatsResponse getQuizStats(UUID deploymentId) {
        byte[] depIdBytes = uuidToBytes(deploymentId);
        List<QuizAttempt> attempts = attemptRepository.findByDeploymentIdAndDeploymentType(depIdBytes, QuizAttempt.DeploymentType.GROUP_QUIZ);
        
        if (attempts.isEmpty()) {
            return QuizStatsResponse.builder().quizId(deploymentId).build();
        }

        double totalScore = attempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0).sum();
        long passedCount = attempts.stream().filter(a -> a.getPassed() != null && a.getPassed()).count();
        
        Map<String, Long> distribution = new TreeMap<>();
        Map<UUID, QuizStatsResponse.QuestionStats> questionStatsMap = new HashMap<>();

        for (QuizAttempt a : attempts) {
            int score = a.getScore() != null ? a.getScore() : 0;
            String bucket = (score / 10 * 10) + "-" + (score / 10 * 10 + 9);
            distribution.put(bucket, distribution.getOrDefault(bucket, 0L) + 1);

            List<QuizResponse> responses = responseRepository.findByAttempt_Id(a.getId());
            for (QuizResponse r : responses) {
                UUID qId = r.getQuestion().getId();
                QuizStatsResponse.QuestionStats qs = questionStatsMap.computeIfAbsent(qId, id -> 
                    QuizStatsResponse.QuestionStats.builder()
                        .questionId(id)
                        .content(r.getQuestion().getContent())
                        .wrongCount(0)
                        .build()
                );
                if (r.getCorrect() != null && !r.getCorrect()) {
                    qs.setWrongCount(qs.getWrongCount() + 1);
                }
            }
        }

        List<QuizStatsResponse.QuestionStats> mostWrong = questionStatsMap.values().stream()
                .peek(qs -> qs.setWrongPercentage((double) qs.getWrongCount() / attempts.size() * 100))
                .sorted((a, b) -> Long.compare(b.getWrongCount(), a.getWrongCount()))
                .limit(5)
                .collect(Collectors.toList());

        return QuizStatsResponse.builder()
                .quizId(deploymentId)
                .averageScore(totalScore / attempts.size())
                .totalAttempts(attempts.size())
                .passRate((double) passedCount / attempts.size() * 100)
                .scoreDistribution(distribution)
                .mostWrongQuestions(mostWrong)
                .build();
    }

    private QuizAttemptResponse mapToResponse(QuizAttempt attempt) {
        List<QuizResponse> responses = responseRepository.findByAttempt_Id(attempt.getId());
        
        return QuizAttemptResponse.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .userId(attempt.getUser().getId())
                .score(attempt.getScore())
                .attemptNumber(attempt.getAttemptNumber())
                .passed(attempt.getPassed())
                .passingScore(attempt.getQuiz().getPassingScore())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .userName(attempt.getUser().getFullName())
                .responses(responses.stream().map(r -> QuizAttemptResponse.QuestionResultResponse.builder()
                        .questionId(r.getQuestion().getId())
                        .questionContent(r.getQuestion().getContent())
                        .content(r.getSelectedAnswer() != null ? r.getSelectedAnswer().getContent() : r.getTextResponse())
                        .correct(r.getCorrect() != null ? r.getCorrect() : false)
                        .points(r.getPointsEarned())
                        .totalPoints(r.getQuestion().getPoints())
                        .explanation(r.getQuestion().getExplanation())
                        .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
