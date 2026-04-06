package project.TeamFive.ExLMS.quiz.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import project.TeamFive.ExLMS.entity.SoftDeletableEntity;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;

@Entity
@Table(name = "quizzes")
@SQLDelete(sql = "UPDATE quizzes SET deleted_at = NOW() WHERE id = ?")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz extends SoftDeletableEntity {

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> questions;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "time_limit_sec")
    private Integer timeLimitSec;

    @Column(name = "max_attempts", nullable = false)
    @Builder.Default
    private int maxAttempts = 1;

    @Column(name = "passing_score", nullable = false)
    @Builder.Default
    private int passingScore = 50;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
