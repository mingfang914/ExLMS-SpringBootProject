package project.TeamFive.ExLMS.quiz.service;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
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
import project.TeamFive.ExLMS.notification.service.NotificationService;

import java.util.ArrayList;
import java.util.Collections;
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
    private final project.TeamFive.ExLMS.group.repository.GroupMemberRepository groupMemberRepository;
    private final NotificationService notificationService;

    @Transactional
    public QuizResponseDTO createTemplate(CreateQuizRequest request, User user) {
        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .timeLimitSec(request.getTimeLimitSec())
                .maxAttempts(request.getMaxAttempts())
                .passingScore(request.getPassingScore())
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

        quiz = quizRepository.save(quiz);

        // Update Questions
        if (request.getQuestions() != null) {
            if (quiz.getQuestions() != null) {
                quiz.getQuestions().clear();
                quizRepository.saveAndFlush(quiz);
            }
            saveQuestionsAndAnswers(quiz, request.getQuestions());
        }

        return mapToResponseDTO(quiz, null);
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDTO> getTemplatesByCreator(User user) {
        return quizRepository.findByCreatedByAndDeletedAtIsNull(user).stream()
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

        validateDates(config.getOpenAt(), config.getCloseAt(), true);

        LocalDateTime openAt = config.getOpenAt() != null ? config.getOpenAt() : java.time.LocalDateTime.now();
        LocalDateTime closeAt = config.getCloseAt() != null ? config.getCloseAt() : openAt.plusHours(2);

        GroupQuiz.GroupQuizStatus targetStatus;
        if (config.getStatus() != null) {
            try {
                targetStatus = GroupQuiz.GroupQuizStatus.valueOf(config.getStatus());
            } catch (Exception e) {
                targetStatus = openAt.isAfter(java.time.LocalDateTime.now()) 
                        ? GroupQuiz.GroupQuizStatus.DRAFT 
                        : GroupQuiz.GroupQuizStatus.PUBLISHED;
            }
        } else {
            targetStatus = openAt.isAfter(java.time.LocalDateTime.now()) 
                    ? GroupQuiz.GroupQuizStatus.DRAFT 
                    : GroupQuiz.GroupQuizStatus.PUBLISHED;
        }

        GroupQuiz deployment = GroupQuiz.builder()
                .group(group)
                .quiz(template)
                .openAt(openAt)
                .closeAt(closeAt)
                .shuffleQuestions(config.isShuffleQuestions())
                .resultVisibility(config.getResultVisibility() != null ? config.getResultVisibility() : GroupQuiz.ResultVisibility.IMMEDIATE)
                .status(targetStatus)
                .build();

        GroupQuiz savedDeployment = groupQuizRepository.save(deployment);

        // Gửi thông báo và tín hiệu refresh UI
        notificationService.notifyGroupPublishedItem(
            group, 
            "Bài kiểm tra", 
            template.getTitle(), 
            savedDeployment.getStatus().name(), 
            savedDeployment.getId(), 
            "/quizzes/" + savedDeployment.getId()
        );

        return mapToResponseDTO(template, savedDeployment);
    }

    @Transactional(readOnly = true)
    public List<QuizResponseDTO> getQuizzesByGroup(UUID groupId, User user) {
        project.TeamFive.ExLMS.group.entity.GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        boolean isInstructor = "OWNER".equals(member.getRole()) || "EDITOR".equals(member.getRole());

        return groupQuizRepository.findByGroup_Id(groupId).stream()
                .filter(gq -> isInstructor || (gq.getStatus() != GroupQuiz.GroupQuizStatus.DRAFT && gq.getStatus() != GroupQuiz.GroupQuizStatus.CLOSED))
                .map(gq -> mapToResponseDTO(gq.getQuiz(), gq))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizResponseDTO getQuizDeploymentById(UUID deploymentId) {
        GroupQuiz deployment = groupQuizRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt kiểm tra này!"));
        return mapToResponseDTO(deployment.getQuiz(), deployment);
    }

    private QuizQuestion.QuestionType safeQuestionType(String type) {
        if (type == null) return QuizQuestion.QuestionType.SINGLE_CHOICE;
        try {
            return QuizQuestion.QuestionType.valueOf(type);
        } catch (IllegalArgumentException e) {
            return QuizQuestion.QuestionType.SINGLE_CHOICE;
        }
    }

    private void saveQuestionsAndAnswers(Quiz quiz, List<CreateQuizRequest.QuestionRequest> questions) {
        for (int i = 0; i < questions.size(); i++) {
            CreateQuizRequest.QuestionRequest qr = questions.get(i);
            QuizQuestion qq = QuizQuestion.builder()
                    .quiz(quiz)
                    .content(qr.getContent())
                    .questionType(safeQuestionType(qr.getQuestionType()))
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
        List<QuizQuestion> questionsList = questionRepository.findByQuizId(quiz.getId());
        
        boolean shouldShuffle = (deployment != null && deployment.isShuffleQuestions());
        
        if (shouldShuffle) {
            questionsList = new ArrayList<>(questionsList);
            Collections.shuffle(questionsList);
        }

        List<QuizResponseDTO.QuestionResponse> questionResponses = questionsList.stream()
                .map(q -> {
                    List<QuizAnswer> answers = new ArrayList<>(answerRepository.findByQuestion_IdOrderByOrderIndexAsc(q.getId()));
                    if (shouldShuffle) Collections.shuffle(answers);
                    return QuizResponseDTO.QuestionResponse.builder()
                            .id(q.getId())
                            .content(project.TeamFive.ExLMS.util.UrlUtils.normalizeCkeUrls(q.getContent()))
                            .questionType(q.getQuestionType() != null ? q.getQuestionType().name() : "SINGLE_CHOICE")
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
                .questionCount(questionsList.size())
                .questions(questionResponses);

        if (deployment != null) {
            builder.id(deployment.getId());
            builder.openAt(deployment.getOpenAt());
            builder.closeAt(deployment.getCloseAt());
            builder.shuffleQuestions(deployment.isShuffleQuestions());
            builder.resultVisibility(deployment.getResultVisibility());
            builder.status(deployment.getStatus());
        }

        return builder.build();
    }

    @Transactional
    public void deleteTemplate(UUID id, User user) {
        Quiz quiz = quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu trắc nghiệm!"));
        if (!quiz.getCreatedBy().getId().equals(user.getId())) throw new RuntimeException("Unauthorized");
        // Soft delete: bảo toàn quiz_attempts/responses, chỉ ẩn template khỏi danh sách
        quiz.softDelete();
        quizRepository.save(quiz);
    }

    @Transactional
    public void deleteDeployment(UUID id) {
        GroupQuiz deployment = groupQuizRepository.findById(id).orElseThrow(() -> new RuntimeException("Deployment not found"));
        if (deployment.getStatus() == GroupQuiz.GroupQuizStatus.CLOSED) throw new RuntimeException("Cannot delete closed quiz");
        groupQuizRepository.delete(deployment);
    }

    @Transactional
    public QuizResponseDTO updateQuizDeployment(UUID deploymentId, CreateQuizRequest request, User user) {
        GroupQuiz deployment = groupQuizRepository.findById(deploymentId).orElseThrow(() -> new RuntimeException("Deployment not found"));
        if (deployment.getStatus() == GroupQuiz.GroupQuizStatus.CLOSED) throw new RuntimeException("Locked closed quiz");

        if (request.getOpenAt() != null && !request.getOpenAt().isEqual(deployment.getOpenAt())) {
             throw new RuntimeException("Cannot change start time after creation");
        }
        if (request.getCloseAt() != null) {
            validateDates(deployment.getOpenAt(), request.getCloseAt(), false);
            deployment.setCloseAt(request.getCloseAt());
        }
        deployment.setShuffleQuestions(request.isShuffleQuestions());
        if (request.getResultVisibility() != null) deployment.setResultVisibility(request.getResultVisibility());
        
        GroupQuiz.GroupQuizStatus oldStatus = deployment.getStatus();
        if (request.getStatus() != null) {
            String newStatus = request.getStatus();
            if (!"CLOSED".equals(newStatus)) {
                try { deployment.setStatus(GroupQuiz.GroupQuizStatus.valueOf(newStatus)); } catch (Exception e) {}
            }
        }

        GroupQuiz savedDeployment = groupQuizRepository.save(deployment);
        
        if (oldStatus == GroupQuiz.GroupQuizStatus.DRAFT && savedDeployment.getStatus() == GroupQuiz.GroupQuizStatus.PUBLISHED) {
            notificationService.notifyGroupPublishedItem(
                deployment.getGroup(), "Bài kiểm tra", deployment.getQuiz().getTitle(), 
                savedDeployment.getStatus().name(), savedDeployment.getId(), "/quizzes/" + savedDeployment.getId()
            );
        } else {
            notificationService.broadcastResourceStatus(savedDeployment.getId(), "Bài kiểm tra", savedDeployment.getStatus().name());
        }

        return mapToResponseDTO(deployment.getQuiz(), savedDeployment);
    }

    private void validateDates(java.time.LocalDateTime start, java.time.LocalDateTime end, boolean isNew) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (isNew && start != null && start.isAfter(now.minusSeconds(10)) == false) throw new RuntimeException("Mở đề phải >= hiện tại");
        if (start != null && end != null && end.isBefore(start)) throw new RuntimeException("Đóng đề phải sau mở đề");
    }
}
