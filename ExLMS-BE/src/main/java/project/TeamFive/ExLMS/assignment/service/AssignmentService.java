package project.TeamFive.ExLMS.assignment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.assignment.dto.request.CreateAssignmentRequest;
import project.TeamFive.ExLMS.assignment.dto.response.AssignmentResponseDTO;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;
import project.TeamFive.ExLMS.assignment.repository.AssignmentRepository;
import project.TeamFive.ExLMS.assignment.repository.GroupAssignmentRepository;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.notification.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final GroupAssignmentRepository groupAssignmentRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final project.TeamFive.ExLMS.group.repository.GroupMemberRepository groupMemberRepository;
    private final NotificationService notificationService;

    @Transactional
    public AssignmentResponseDTO createTemplate(CreateAssignmentRequest request, User creator) {
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .maxScore(request.getMaxScore() != null ? request.getMaxScore() : 100)
                .submissionType(safeSubmissionType(request.getSubmissionType()))
                .allowedFileTypes(request.getAllowedFileTypes())
                .maxFileSizeMb(request.getMaxFileSizeMb() != null ? request.getMaxFileSizeMb() : 50)
                .createdBy(creator)
                .build();
        return mapToResponseDTO(assignmentRepository.save(assignment), null);
    }

    private Assignment.SubmissionType safeSubmissionType(String type) {
        if (type == null) return Assignment.SubmissionType.FILE;
        try {
            return Assignment.SubmissionType.valueOf(type);
        } catch (IllegalArgumentException e) {
            return Assignment.SubmissionType.FILE;
        }
    }

    @Transactional
    public AssignmentResponseDTO updateTemplate(UUID id, CreateAssignmentRequest request, User user) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu bài tập!"));

        if (!assignment.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bản mẫu này!");
        }

        if (request.getTitle() != null) assignment.setTitle(request.getTitle());
        if (request.getDescription() != null) assignment.setDescription(request.getDescription());
        if (request.getMaxScore() != null) assignment.setMaxScore(request.getMaxScore());
        
        if (request.getSubmissionType() != null) {
            assignment.setSubmissionType(safeSubmissionType(request.getSubmissionType()));
        }
        
        if (request.getAllowedFileTypes() != null) {
            assignment.setAllowedFileTypes(request.getAllowedFileTypes());
        }
        
        if (request.getMaxFileSizeMb() != null) {
            assignment.setMaxFileSizeMb(request.getMaxFileSizeMb());
        }

        return mapToResponseDTO(assignmentRepository.save(assignment), null);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponseDTO> getTemplatesByCreator(User user) {
        return assignmentRepository.findByCreatedBy(user).stream()
                .map(a -> mapToResponseDTO(a, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssignmentResponseDTO getTemplateById(UUID id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu bài tập!"));
        return mapToResponseDTO(assignment, null);
    }

    @Transactional
    public AssignmentResponseDTO deployToGroup(UUID groupId, UUID templateId, CreateAssignmentRequest config, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm học tập!"));

        Assignment assignment = assignmentRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu bài tập!"));

        validateDates(config.getAssignedAt(), config.getDueAt(), true);

        LocalDateTime assignedAt = config.getAssignedAt() != null ? config.getAssignedAt() : LocalDateTime.now();
        LocalDateTime dueAt = config.getDueAt() != null ? config.getDueAt() : LocalDateTime.now().plusDays(7);

        GroupAssignment.GroupAssignmentStatus targetStatus;
        if (config.getStatus() != null) {
            try {
                targetStatus = GroupAssignment.GroupAssignmentStatus.valueOf(config.getStatus());
            } catch (Exception e) {
                targetStatus = assignedAt.isAfter(LocalDateTime.now()) 
                        ? GroupAssignment.GroupAssignmentStatus.DRAFT 
                        : GroupAssignment.GroupAssignmentStatus.PUBLISHED;
            }
        } else {
            targetStatus = assignedAt.isAfter(LocalDateTime.now()) 
                    ? GroupAssignment.GroupAssignmentStatus.DRAFT 
                    : GroupAssignment.GroupAssignmentStatus.PUBLISHED;
        }

        GroupAssignment deployment = GroupAssignment.builder()
                .group(group)
                .assignment(assignment)
                .assignedAt(assignedAt)
                .dueAt(dueAt)
                .allowLate(config.getAllowLate() != null ? config.getAllowLate() : false)
                .latePenaltyPercent(config.getLatePenaltyPercent() != null ? config.getLatePenaltyPercent() : 0)
                .status(targetStatus)
                .build();

        GroupAssignment savedDeployment = groupAssignmentRepository.save(deployment);

        // Phát thông báo và gửi tín hiệu cập nhật list
        notificationService.notifyGroupPublishedItem(
            group, 
            "Bài tập", 
            assignment.getTitle(), 
            savedDeployment.getStatus().name(), 
            savedDeployment.getId(), 
            "/assignments/" + savedDeployment.getId()
        );

        return mapToResponseDTO(assignment, savedDeployment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponseDTO> getAssignmentsByGroup(UUID groupId, User user) {
        project.TeamFive.ExLMS.group.entity.GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(groupId, user.getId())
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của nhóm này!"));

        boolean isInstructor = "OWNER".equals(member.getRole()) || "EDITOR".equals(member.getRole());

        return groupAssignmentRepository.findByGroup_Id(groupId).stream()
                .filter(ga -> isInstructor || (ga.getStatus() != GroupAssignment.GroupAssignmentStatus.DRAFT && ga.getStatus() != GroupAssignment.GroupAssignmentStatus.CLOSED))
                .map(ga -> mapToResponseDTO(ga.getAssignment(), ga))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssignmentResponseDTO getAssignmentDeploymentById(UUID deploymentId) {
        GroupAssignment deployment = groupAssignmentRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt giao bài tập này!"));
        return mapToResponseDTO(deployment.getAssignment(), deployment);
    }

    @Transactional
    public void deleteAssignment(UUID id) {
        groupAssignmentRepository.deleteByAssignment_Id(id);
        assignmentRepository.deleteById(id);
    }

    @Transactional
    public void deleteTemplate(UUID id, User user) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản mẫu bài tập!"));

        if (!assignment.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa bản mẫu này!");
        }

        groupAssignmentRepository.deleteByAssignment_Id(id);
        assignmentRepository.delete(assignment);
    }

    @Transactional
    public AssignmentResponseDTO updateAssignmentDeployment(UUID deploymentId, CreateAssignmentRequest request, User user) {
        GroupAssignment deployment = groupAssignmentRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt giao bài tập này!"));

        if (deployment.getStatus() == GroupAssignment.GroupAssignmentStatus.CLOSED) {
            throw new RuntimeException("Bài tập này đã kết thúc (CLOSED), không thể chỉnh sửa!");
        }

        if (request.getAssignedAt() != null && !request.getAssignedAt().isEqual(deployment.getAssignedAt())) {
             throw new RuntimeException("Không được phép thay đổi thời gian bắt đầu sau khi đã giao bài tập!");
        }

        if (request.getDueAt() != null) {
            validateDates(deployment.getAssignedAt(), request.getDueAt(), false);
            deployment.setDueAt(request.getDueAt());
        }
        if (request.getAllowLate() != null) deployment.setAllowLate(request.getAllowLate());
        if (request.getLatePenaltyPercent() != null) deployment.setLatePenaltyPercent(request.getLatePenaltyPercent());
        
        GroupAssignment.GroupAssignmentStatus oldStatus = deployment.getStatus();

        if (request.getStatus() != null) {
            String newStatus = request.getStatus();
            if ("CLOSED".equals(newStatus)) {
                throw new RuntimeException("Không thể chuyển trạng thái sang CLOSED thủ công bằng chức năng này!");
            }
            try {
                deployment.setStatus(GroupAssignment.GroupAssignmentStatus.valueOf(newStatus));
            } catch (Exception e) {}
        }

        GroupAssignment savedDeployment = groupAssignmentRepository.save(deployment);
        
        // Gửi thông báo nếu chuyển nháp sang công khai
        if (oldStatus == GroupAssignment.GroupAssignmentStatus.DRAFT && savedDeployment.getStatus() == GroupAssignment.GroupAssignmentStatus.PUBLISHED) {
            notificationService.notifyGroupPublishedItem(
                deployment.getGroup(), 
                "Bài tập", 
                deployment.getAssignment().getTitle(), 
                savedDeployment.getStatus().name(), 
                savedDeployment.getId(), 
                "/assignments/" + savedDeployment.getId()
            );
        } else {
            // Vẫn phát broadcast để UI refresh nếu có thay đổi khác
            notificationService.broadcastResourceStatus(savedDeployment.getId(), "Bài tập", savedDeployment.getStatus().name());
        }

        return mapToResponseDTO(deployment.getAssignment(), savedDeployment);
    }

    @Transactional
    public void deleteAssignmentDeployment(UUID deploymentId) {
        GroupAssignment deployment = groupAssignmentRepository.findById(deploymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt giao bài tập này!"));

        if (deployment.getStatus() == GroupAssignment.GroupAssignmentStatus.CLOSED) {
            throw new RuntimeException("Dữ liệu bài tập đã kết thúc (CLOSED) sẽ được lưu trữ làm lịch sử, không thể xóa!");
        }

        groupAssignmentRepository.delete(deployment);
    }

    private void validateDates(LocalDateTime start, LocalDateTime end, boolean isNew) {
        LocalDateTime now = LocalDateTime.now();
        if (isNew && start != null && start.isBefore(now.minusSeconds(10))) {
            throw new RuntimeException("Thời gian bắt đầu không được nhỏ hơn thời gian hiện tại!");
        }
        if (start != null && end != null && end.isBefore(start)) {
            throw new RuntimeException("Thời gian đóng bài tập không được nhỏ hơn thời gian bắt đầu!");
        }
    }

    private AssignmentResponseDTO mapToResponseDTO(Assignment assignment, GroupAssignment deployment) {
        AssignmentResponseDTO.AssignmentResponseDTOBuilder builder = AssignmentResponseDTO.builder()
                .templateId(assignment.getId())
                .title(assignment.getTitle())
                .description(project.TeamFive.ExLMS.util.UrlUtils.normalizeCkeUrls(assignment.getDescription()))
                .maxScore(assignment.getMaxScore())
                .submissionType(assignment.getSubmissionType())
                .allowedFileTypes(assignment.getAllowedFileTypes())
                .maxFileSizeMb(assignment.getMaxFileSizeMb());

        if (deployment != null) {
            builder.id(deployment.getId());
            builder.groupId(deployment.getGroup().getId());
            builder.assignedAt(deployment.getAssignedAt());
            builder.dueAt(deployment.getDueAt());
            builder.allowLate(deployment.isAllowLate());
            builder.latePenaltyPercent(deployment.getLatePenaltyPercent());
            builder.status(deployment.getStatus());
        }

        return builder.build();
    }
}
