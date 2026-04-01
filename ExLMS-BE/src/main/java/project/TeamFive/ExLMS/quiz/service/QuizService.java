package project.TeamFive.ExLMS.quiz.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.quiz.dto.request.CreateQuizRequest;
import project.TeamFive.ExLMS.quiz.dto.response.QuizResponseDTO;
import project.TeamFive.ExLMS.quiz.entity.GroupQuiz;
import project.TeamFive.ExLMS.quiz.entity.Quiz;
import project.TeamFive.ExLMS.quiz.entity.QuizAnswer;
import project.TeamFive.ExLMS.quiz.entity.QuizQuestion;
import project.TeamFive.ExLMS.quiz.repository.GroupQuizRepository;
import project.TeamFive.ExLMS.quiz.repository.QuizAnswerRepository;
import project.TeamFive.ExLMS.quiz.repository.QuizQuestionRepository;
import project.TeamFive.ExLMS.quiz.repository.QuizRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizAnswerRepository answerRepository;
    private final GroupQuizRepository groupQuizRepository;
    private final StudyGroupRepository studyGroupRepository;

    @Transactional
    public QuizResponseDTO createTemplate(CreateQuizRequest request, User user) {
        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .timeLimitSec(request.getTimeLimitSec())
                .maxAttempts(request.getMaxAttempts())
                .passingScore(request.getPassingScore())
                .shuffleQuestions(request.isShuffleQuestions())
                .resultVisibility(request.getResultVisibility())
                .createdBy(user)
                .build();

        quiz = quizRepository.save(quiz);

        if (request.getQuestions() != null) {
            saveQuestionsAndAnswers(quiz, request.getQuestions());
        }

        return mapToResponseDTO(quiz, null);
    }

    @Transactional
    public QuizResponseDTO updateTemplate(UUID id, CreateQuizRequest request, User user) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu trắc nghiệm!"));

        if (!quiz.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bản mẫu này!");
        }

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setTimeLimitSec(request.getTimeLimitSec());
        quiz.setMaxAttempts(request.getMaxAttempts());
        quiz.setPassingScore(request.getPassingScore());
        quiz.setShuffleQuestions(request.isShuffleQuestions());
        quiz.setResultVisibility(request.getResultVisibility());

        quiz = quizRepository.save(quiz);

        // Update Questions
        if (request.getQuestions() != null) {
            // Delete old answers and questions
            List<QuizQuestion> oldQuestions = questionRepository.findByQuizId(id);
            for (QuizQuestion q : oldQuestions) {
                // Actually need QuizAnswerRepository.deleteByQuestionId if not cascading
                // Assuming it cascades or we delete manually
                answerRepository.deleteByQuestion_Id(q.getId());
            }
            questionRepository.deleteByQuizId(id);

            saveQuestionsAndAnswers(quiz, request.getQuestions());
        }

        return mapToResponseDTO(quiz, null);
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDTO> getTemplatesByCreator(User user) {
        return quizRepository.findByCreatedBy(user).stream()
                .map(q -> mapToResponseDTO(q, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizResponseDTO getTemplateById(UUID id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu trắc nghiệm!"));
        return mapToResponseDTO(quiz, null);
    }

    @Transactional
    public QuizResponseDTO deployToGroup(UUID groupId, UUID templateId, CreateQuizRequest config, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập!"));

        Quiz template = quizRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu trắc nghiệm!"));

        GroupQuiz deployment = GroupQuiz.builder()
                .group(group)
                .quiz(template)
                .openAt(config.getOpenAt())
                .closeAt(config.getCloseAt())
                .status(GroupQuiz.GroupQuizStatus.PUBLISHED)
                .build();

        return mapToResponseDTO(template, groupQuizRepository.save(deployment));
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDTO> getQuizzesByGroup(UUID groupId) {
        return groupQuizRepository.findByGroup_Id(groupId).stream()
                .map(gq -> mapToResponseDTO(gq.getQuiz(), gq))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizResponseDTO getQuizDeploymentById(UUID deploymentId) {
        GroupQuiz deployment = groupQuizRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt kiểm tra này!"));
        return mapToResponseDTO(deployment.getQuiz(), deployment);
    }

    private void saveQuestionsAndAnswers(Quiz quiz, List<CreateQuizRequest.QuestionRequest> questions) {
        for (int i = 0; i < questions.size(); i++) {
            CreateQuizRequest.QuestionRequest qr = questions.get(i);
            QuizQuestion qq = QuizQuestion.builder()
                    .quiz(quiz)
                    .content(qr.getContent())
                    .questionType(QuizQuestion.QuestionType.valueOf(qr.getQuestionType() != null ? qr.getQuestionType() : "SINGLE_CHOICE"))
                    .points(qr.getPoints())
                    .explanation(qr.getExplanation())
                    .orderIndex(i)
                    .build();
            qq = questionRepository.save(qq);

            if (qr.getAnswers() != null) {
                for (int j = 0; j < qr.getAnswers().size(); j++) {
                    CreateQuizRequest.AnswerRequest ar = qr.getAnswers().get(j);
                    QuizAnswer qa = QuizAnswer.builder()
                            .question(qq)
                            .content(ar.getContent())
                            .correct(ar.isCorrect())
                            .orderIndex(j)
                            .build();
                    answerRepository.save(qa);
                }
            }
        }
    }

    private QuizResponseDTO mapToResponseDTO(Quiz quiz, GroupQuiz deployment) {
        List<QuizQuestion> questions = questionRepository.findByQuizId(quiz.getId());
        List<QuizResponseDTO.QuestionResponse> questionResponses = questions.stream()
                .map(q -> {
                    List<QuizAnswer> answers = answerRepository.findByQuestion_IdOrderByOrderIndexAsc(q.getId());
                    return QuizResponseDTO.QuestionResponse.builder()
                            .id(q.getId())
                            .content(project.TeamFive.ExLMS.util.UrlUtils.normalizeCkeUrls(q.getContent()))
                            .questionType(q.getQuestionType().name())
                            .points(q.getPoints())
                            .explanation(q.getExplanation())
                            .answers(answers.stream()
                                    .map(a -> QuizResponseDTO.AnswerResponse.builder()
                                            .id(a.getId())
                                            .content(project.TeamFive.ExLMS.util.UrlUtils.normalizeCkeUrls(a.getContent()))
                                            .correct(a.isCorrect())
                                            .build())
                                    .collect(Collectors.toList()))
                            .build();
                })
                .collect(Collectors.toList());

        QuizResponseDTO.QuizResponseDTOBuilder builder = QuizResponseDTO.builder()
                .templateId(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitSec(quiz.getTimeLimitSec())
                .maxAttempts(quiz.getMaxAttempts())
                .passingScore(quiz.getPassingScore())
                .shuffleQuestions(quiz.isShuffleQuestions())
                .resultVisibility(quiz.getResultVisibility())
                .questions(questionResponses);

        if (deployment != null) {
            builder.id(deployment.getId());
        }

        return builder.build();
    }

    @Transactional
    public void deleteTemplate(UUID id, User user) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu trắc nghiệm!"));

        if (!quiz.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa bản mẫu này!");
        }

        groupQuizRepository.deleteByQuiz_Id(id);
        questionRepository.deleteByQuizId(id);
        quizRepository.delete(quiz);
    }
}
