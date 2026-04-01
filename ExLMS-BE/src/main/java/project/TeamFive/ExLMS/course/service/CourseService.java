package project.TeamFive.ExLMS.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.course.dto.request.CourseRequest;
import project.TeamFive.ExLMS.course.dto.response.CourseResponse;
import project.TeamFive.ExLMS.course.entity.Course;
import project.TeamFive.ExLMS.course.entity.GroupCourse;
import project.TeamFive.ExLMS.course.event.CourseCreatedEvent;
import project.TeamFive.ExLMS.course.event.CourseDeletedEvent;
import project.TeamFive.ExLMS.course.event.CourseUpdatedEvent;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.course.repository.CourseRepository;
import project.TeamFive.ExLMS.course.repository.GroupCourseRepository;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.service.FileService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final GroupCourseRepository groupCourseRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final FileService fileService;
    private final ApplicationEventPublisher eventPublisher;

    private void requireInstructorRole(StudyGroup group, User user) {
        GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new RuntimeException("Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền quản lý khóa học!");
        }
    }

    @Transactional
    public CourseResponse createCourse(UUID groupId, CourseRequest request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập!"));

        requireInstructorRole(group, currentUser);

        String thumbnailKey = request.getThumbnailKey();
        if (thumbnailKey == null || thumbnailKey.trim().isEmpty()) {
            thumbnailKey = "DefaultCourseImg.png";
        }

        Course template = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailKey(thumbnailKey)
                .createdBy(currentUser)
                .build();
        template = courseRepository.save(template);

        GroupCourse deployment = GroupCourse.builder()
                .group(group)
                .course(template)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(GroupCourse.GroupCourseStatus.PUBLISHED)
                .build();
        deployment = groupCourseRepository.save(deployment);

        eventPublisher.publishEvent(new CourseCreatedEvent(this, deployment));
        return mapToResponse(deployment);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByGroupId(UUID groupId) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập!"));

        if (!groupMemberRepository.existsByGroupAndUser(group, currentUser)) {
            throw new RuntimeException("Bạn phải tham gia nhóm mới xem được khóa học!");
        }

        return groupCourseRepository.findByGroup_Id(groupId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseDeploymentById(UUID deploymentId) {
        GroupCourse deployment = groupCourseRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt mở khóa học này!"));
        return mapToResponse(deployment);
    }

    @Transactional
    public CourseResponse updateCourseDeployment(UUID deploymentId, CourseRequest request) {
        GroupCourse deployment = groupCourseRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt mở khóa học này!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        requireInstructorRole(deployment.getGroup(), currentUser);

        Course template = deployment.getCourse();
        if (request.getTitle() != null) template.setTitle(request.getTitle());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getThumbnailKey() != null) template.setThumbnailKey(request.getThumbnailKey());
        courseRepository.save(template);

        if (request.getStartDate() != null) deployment.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) deployment.setEndDate(request.getEndDate());
        if (request.getStatus() != null) {
            try {
                deployment.setStatus(GroupCourse.GroupCourseStatus.valueOf(request.getStatus()));
            } catch (Exception e) {}
        }
        deployment = groupCourseRepository.save(deployment);

        eventPublisher.publishEvent(new CourseUpdatedEvent(this, deployment));
        return mapToResponse(deployment);
    }

    @Transactional
    public String deleteCourseDeployment(UUID deploymentId) {
        GroupCourse deployment = groupCourseRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt mở khóa học này!"));

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        requireInstructorRole(deployment.getGroup(), currentUser);

        groupCourseRepository.delete(deployment);
        eventPublisher.publishEvent(new CourseDeletedEvent(this, deploymentId));
        return "Đã xóa đợt mở khóa học thành công!";
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getTemplatesByCreator(User creator) {
        return courseRepository.findByCreatedBy(creator)
                .stream()
                .map(this::mapTemplateToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseResponse getTemplateById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu khóa học!"));
        return mapTemplateToResponse(course);
    }

    @Transactional
    public void deployCourses(UUID groupId, List<UUID> templateIds, CourseRequest request, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập!"));

        requireInstructorRole(group, user);

        for (UUID templateId : templateIds) {
            Course template = courseRepository.findById(templateId)
                    .orElseThrow(() -> new RuntimeException("Template not found: " + templateId));

            GroupCourse deployment = GroupCourse.builder()
                    .group(group)
                    .course(template)
                    .startDate(request.getStartDate())
                    .endDate(request.getEndDate())
                    .status(GroupCourse.GroupCourseStatus.PUBLISHED)
                    .build();
            groupCourseRepository.save(deployment);
            eventPublisher.publishEvent(new CourseCreatedEvent(this, deployment));
        }
    }

    @Transactional
    public CourseResponse createTemplate(CourseRequest request, User user) {
        String thumbnailKey = request.getThumbnailKey();
        if (thumbnailKey == null || thumbnailKey.trim().isEmpty()) {
            thumbnailKey = "DefaultCourseImg.png";
        }

        Course template = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailKey(thumbnailKey)
                .createdBy(user)
                .build();
        return mapTemplateToResponse(courseRepository.save(template));
    }

    @Transactional
    public CourseResponse updateTemplate(UUID templateId, CourseRequest request, User user) {
        Course template = courseRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bản mẫu này!");
        }

        if (request.getTitle() != null) template.setTitle(request.getTitle());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getThumbnailKey() != null) template.setThumbnailKey(request.getThumbnailKey());

        return mapTemplateToResponse(courseRepository.save(template));
    }

    private CourseResponse mapTemplateToResponse(Course template) {
        String thumbUrl = null;
        if (template.getThumbnailKey() != null && !template.getThumbnailKey().trim().isEmpty()) {
            thumbUrl = "/api/files/download/" + template.getThumbnailKey();
        }

        return CourseResponse.builder()
                .templateId(template.getId())
                .title(template.getTitle())
                .description(template.getDescription())
                .thumbnailUrl(thumbUrl)
                .build();
    }

    private CourseResponse mapToResponse(GroupCourse deployment) {
        CourseResponse res = mapTemplateToResponse(deployment.getCourse());
        res.setId(deployment.getId());
        res.setGroupId(deployment.getGroup().getId());
        res.setStatus(deployment.getStatus().name());
        res.setStartDate(deployment.getStartDate());
        res.setEndDate(deployment.getEndDate());
        return res;
    }
}
