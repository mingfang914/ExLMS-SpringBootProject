package project.TeamFive.ExLMS.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.dto.response.LessonResponse;
import project.TeamFive.ExLMS.course.entity.*;
import project.TeamFive.ExLMS.course.repository.*;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final CourseLessonRepository lessonRepository;
    private final CourseChapterRepository chapterRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository progressRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupCourseRepository groupCourseRepository;

    private void requireInstructorRole(CourseChapter chapter, User user) {
        // Find if this course template is deployed in any group where the user is an instructor
        List<GroupCourse> deployments = groupCourseRepository.findByCourse_Id(chapter.getCourse().getId());
        
        boolean isInstructor = false;
        for (GroupCourse deployment : deployments) {
            var member = groupMemberRepository.findByGroup_IdAndUser_Id(deployment.getGroup().getId(), user.getId());
            if (member.isPresent() && ("OWNER".equals(member.get().getRole()) || "EDITOR".equals(member.get().getRole()))) {
                isInstructor = true;
                break;
            }
        }

        if (!isInstructor && !chapter.getCourse().getCreatedBy().getId().equals(user.getId())) {
             throw new RuntimeException("Bạn không có quyền quản lý nội dung của khóa học này!");
        }
    }

    @Transactional
    public LessonResponse createLesson(UUID chapterId, String title,
            String content, String resourceKey, Integer durationSeconds) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseChapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương học!"));
        requireInstructorRole(chapter, currentUser);

        int nextOrder = lessonRepository.findByChapter_IdAndDeletedAtIsNullOrderByOrderIndexAsc(chapterId).size();

        CourseLesson lesson = CourseLesson.builder()
                .chapter(chapter)
                .title(title)
                .contentType(CourseLesson.ContentType.DOCUMENT)
                .content(content)
                .resourceKey(resourceKey)
                .durationSeconds(durationSeconds != null ? durationSeconds : 0)
                .orderIndex(nextOrder)
                .build();
        return mapToResponse(lessonRepository.save(lesson));
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsByChapter(UUID chapterId) {
        return lessonRepository.findByChapter_IdAndDeletedAtIsNullOrderByOrderIndexAsc(chapterId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonResponse updateLesson(UUID lessonId, String title, String content,
            String resourceKey, Integer durationSeconds) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));
        requireInstructorRole(lesson.getChapter(), currentUser);

        if (title != null) lesson.setTitle(title);
        if (content != null) lesson.setContent(content);
        if (resourceKey != null) lesson.setResourceKey(resourceKey);
        if (durationSeconds != null) lesson.setDurationSeconds(durationSeconds);
        return mapToResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public String deleteLesson(UUID lessonId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));
        requireInstructorRole(lesson.getChapter(), currentUser);
        // Soft delete: đánh dấu xóa, bảo toàn lesson_progress đã ghi nhận
        lesson.softDelete();
        lessonRepository.save(lesson);
        return "Đã xóa bài học!";
    }

    @Transactional
    public String markLessonComplete(UUID lessonId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        CourseLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học!"));

        Course template = lesson.getChapter().getCourse();
        
        // Find if user is enrolled in any deployment of this course
        CourseEnrollment enrollment = null;
        List<GroupCourse> deployments = groupCourseRepository.findByCourse_Id(template.getId());
        for (GroupCourse deployment : deployments) {
            var e = enrollmentRepository.findByGroupCourse_IdAndUser_Id(deployment.getId(), currentUser.getId());
            if (e.isPresent()) {
                enrollment = e.get();
                break;
            }
        }

        if (enrollment == null) {
            throw new RuntimeException("Bạn chưa đăng ký khóa học này trong bất kỳ nhóm nào!");
        }

        // Tạo hoặc cập nhật LessonProgress
        LessonProgress progress = progressRepository
                .findByEnrollment_IdAndLesson_Id(enrollment.getId(), lessonId)
                .orElse(LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .build());

        if (!progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            progressRepository.save(progress);

            // Re-calculate progress
            long completedCount = progressRepository.countByEnrollment_IdAndCompletedTrue(enrollment.getId());

            // Get total lessons in course template
            var allChapters = chapterRepository.findByCourse_IdAndDeletedAtIsNullOrderByOrderIndexAsc(template.getId());
            long totalLessons = allChapters.stream()
                    .mapToLong(c -> lessonRepository.findByChapter_IdAndDeletedAtIsNullOrderByOrderIndexAsc(c.getId()).size())
                    .sum();

            int percent = totalLessons > 0 ? (int) (completedCount * 100 / totalLessons) : 0;
            enrollment.setProgressPercent(Math.min(percent, 100));

            if (enrollment.getProgressPercent() >= 80 && !enrollment.isCompleted()) {
                enrollment.setCompleted(true);
                enrollment.setCompletedAt(LocalDateTime.now());
            }
            enrollmentRepository.save(enrollment);
        }
        return "Đã đánh dấu hoàn thành bài học!";
    }

    private LessonResponse mapToResponse(CourseLesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter().getId())
                .title(lesson.getTitle())
                .contentType(lesson.getContentType().name())
                .content(lesson.getContent())
                .resourceKey(lesson.getResourceKey())
                .durationSeconds(lesson.getDurationSeconds())
                .orderIndex(lesson.getOrderIndex())
                .build();
    }
}
