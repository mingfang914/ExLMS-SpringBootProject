package project.TeamFive.ExLMS.quiz.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.TeamFive.ExLMS.quiz.entity.QuizAttempt;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByQuiz_IdAndUser_Id(UUID quizId, UUID userId);
    
    /** Count only SUBMITTED attempts for a specific deployment — used for max-attempts check */
    long countByDeploymentIdAndDeploymentTypeAndUser_IdAndSubmittedAtIsNotNull(byte[] deploymentId, QuizAttempt.DeploymentType deploymentType, UUID userId);
    
    /** Count ALL attempts for a specific deployment */
    long countByDeploymentIdAndDeploymentTypeAndUser_Id(byte[] deploymentId, QuizAttempt.DeploymentType deploymentType, UUID userId);

    Optional<QuizAttempt> findTopByDeploymentIdAndDeploymentTypeAndUser_IdOrderByAttemptNumberDesc(byte[] deploymentId, QuizAttempt.DeploymentType deploymentType, UUID userId);

    List<QuizAttempt> findByDeploymentIdAndDeploymentType(byte[] deploymentId, QuizAttempt.DeploymentType deploymentType);
    
    List<QuizAttempt> findByDeploymentIdAndDeploymentTypeAndUser_Id(byte[] deploymentId, QuizAttempt.DeploymentType deploymentType, UUID userId);
    
    /** Find all attempts for a template across all deployments */
    List<QuizAttempt> findByQuiz_Id(UUID quizId);
}
