package project.TeamFive.ExLMS.course.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import project.TeamFive.ExLMS.entity.SoftDeletableEntity;

@Entity
@Table(name = "course_lessons")
@SQLDelete(sql = "UPDATE course_lessons SET deleted_at = NOW() WHERE id = ?")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseLesson extends SoftDeletableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private CourseChapter chapter;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    @Builder.Default
    private ContentType contentType = ContentType.DOCUMENT;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "resource_key", length = 36)
    private String resourceKey;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private int orderIndex = 0;

    public enum ContentType {
        VIDEO, DOCUMENT, EMBED, FILE
    }
}
