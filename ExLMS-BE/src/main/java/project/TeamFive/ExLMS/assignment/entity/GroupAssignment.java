package project.TeamFive.ExLMS.assignment.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.group.entity.StudyGroup;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Builder.Default
    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    @Column(name = "due_at", nullable = false)
    private LocalDateTime dueAt;

    @Builder.Default
    @Column(name = "allow_late", nullable = false)
    private boolean allowLate = false;

    @Builder.Default
    @Column(name = "late_penalty_percent", nullable = false)
    private int latePenaltyPercent = 0;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupAssignmentStatus status = GroupAssignmentStatus.DRAFT;

    public enum GroupAssignmentStatus {
        DRAFT, PUBLISHED, CLOSED
    }
}
