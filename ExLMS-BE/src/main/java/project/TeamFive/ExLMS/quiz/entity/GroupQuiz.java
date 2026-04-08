package project.TeamFive.ExLMS.quiz.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.group.entity.StudyGroup;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupQuiz extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "open_at")
    private LocalDateTime openAt;

    @Column(name = "close_at")
    private LocalDateTime closeAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupQuizStatus status = GroupQuizStatus.DRAFT;

    @Column(name = "shuffle_questions", nullable = false)
    @Builder.Default
    private boolean shuffleQuestions = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "result_visibility", nullable = false)
    @Builder.Default
    private ResultVisibility resultVisibility = ResultVisibility.CLOSE;

    public enum ResultVisibility {
        OPEN, CLOSE
    }

    public enum GroupQuizStatus {
        DRAFT, PUBLISHED, CLOSED
    }
}
