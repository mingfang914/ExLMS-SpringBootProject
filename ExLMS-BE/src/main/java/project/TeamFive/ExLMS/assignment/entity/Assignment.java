package project.TeamFive.ExLMS.assignment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import project.TeamFive.ExLMS.entity.SoftDeletableEntity;
import project.TeamFive.ExLMS.user.entity.User;

@Entity
@Table(name = "assignments")
@SQLDelete(sql = "UPDATE assignments SET deleted_at = NOW() WHERE id = ?")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment extends SoftDeletableEntity {



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "max_score", nullable = false)
    private int maxScore = 100;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "submission_type", nullable = false)
    private SubmissionType submissionType = SubmissionType.FILE;

    @Column(name = "allowed_file_types", length = 255)
    private String allowedFileTypes;

    @Builder.Default
    @Column(name = "max_file_size_mb", nullable = false)
    private int maxFileSizeMb = 50;

    public enum SubmissionType {
        FILE, TEXT, MIXED
    }
}
