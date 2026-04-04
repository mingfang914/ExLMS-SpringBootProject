package project.TeamFive.ExLMS.course.entity;

import jakarta.persistence.*;
import lombok.*;
import project.TeamFive.ExLMS.entity.BaseEntity;
import project.TeamFive.ExLMS.group.entity.StudyGroup;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupCourse extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Builder.Default
    @Column(nullable = false)
    private short orderIndex = 0;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupCourseStatus status = GroupCourseStatus.DRAFT;

    public enum GroupCourseStatus {
        DRAFT, PUBLISHED, CLOSED
    }
}
