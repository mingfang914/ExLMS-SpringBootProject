package project.TeamFive.ExLMS.collab.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import project.TeamFive.ExLMS.group.entity.StudyGroup;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_collabs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupCollab {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_image_key")
    private String coverImageKey;

    @Column(name = "document_data", columnDefinition = "LONGTEXT")
    private String documentData;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CollabStatus status = CollabStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum CollabStatus {
        DRAFT,
        PUBLISHED,
        CLOSED
    }
}
