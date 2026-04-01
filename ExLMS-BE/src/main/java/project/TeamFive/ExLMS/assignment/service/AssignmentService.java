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

    @Transactional
    public AssignmentResponseDTO createTemplate(CreateAssignmentRequest request, User creator) {
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .maxScore(request.getMaxScore() != null ? request.getMaxScore() : 100)
                .createdBy(creator)
                .build();
        return mapToResponseDTO(assignmentRepository.save(assignment), null);
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

        GroupAssignment deployment = GroupAssignment.builder()
                .group(group)
                .assignment(assignment)
                .dueAt(config.getDueAt() != null ? config.getDueAt() : LocalDateTime.now().plusDays(7))
                .status(GroupAssignment.GroupAssignmentStatus.PUBLISHED)
                .build();

        return mapToResponseDTO(assignment, groupAssignmentRepository.save(deployment));
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponseDTO> getAssignmentsByGroup(UUID groupId) {
        return groupAssignmentRepository.findByGroup_Id(groupId).stream()
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
