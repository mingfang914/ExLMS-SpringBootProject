package project.TeamFive.ExLMS.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.dto.response.EnrollmentResponse;
import project.TeamFive.ExLMS.course.entity.GroupCourse;
import project.TeamFive.ExLMS.course.entity.CourseEnrollment;
import project.TeamFive.ExLMS.course.repository.CourseEnrollmentRepository;
import project.TeamFive.ExLMS.course.repository.GroupCourseRepository;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final GroupCourseRepository groupCourseRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional
    public EnrollmentResponse enrollCourse(UUID groupCourseId, User currentUser) {
        GroupCourse deployment = groupCourseRepository.findById(groupCourseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt mở khóa học này!"));

        groupMemberRepository
                .findByGroup_IdAndUser_Id(deployment.getGroup().getId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa tham gia nhóm học tập này!"));

        if (deployment.getStatus() != GroupCourse.GroupCourseStatus.PUBLISHED) {
            throw new RuntimeException("Chưa đến thời gian đăng ký hoặc khóa học đã đóng!");
        }

        if (enrollmentRepository.existsByGroupCourse_IdAndUser_Id(groupCourseId, currentUser.getId())) {
            throw new RuntimeException("Bạn đã đăng ký khóa học này rồi!");
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .groupCourse(deployment)
                .user(currentUser)
                .progressPercent(0)
                .completed(false)
                .enrolledAt(LocalDateTime.now())
                .build();

        CourseEnrollment saved = enrollmentRepository.save(enrollment);
        return EnrollmentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Optional<EnrollmentResponse> findMyEnrollment(UUID groupCourseId, User currentUser) {
        return enrollmentRepository.findByGroupCourse_IdAndUser_Id(groupCourseId, currentUser.getId())
                .map(EnrollmentResponse::from);
    }
}
