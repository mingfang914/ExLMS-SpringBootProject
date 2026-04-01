package project.TeamFive.ExLMS.assignment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import project.TeamFive.ExLMS.assignment.dto.request.SubmissionRequest;
import project.TeamFive.ExLMS.assignment.dto.response.SubmissionResponseDTO;
import project.TeamFive.ExLMS.assignment.entity.Assignment;
import project.TeamFive.ExLMS.assignment.entity.AssignmentSubmission;
import project.TeamFive.ExLMS.assignment.entity.GroupAssignment;
import project.TeamFive.ExLMS.assignment.repository.AssignmentGradeRepository;
import project.TeamFive.ExLMS.assignment.repository.AssignmentSubmissionRepository;
import project.TeamFive.ExLMS.assignment.repository.GroupAssignmentRepository;
import project.TeamFive.ExLMS.service.FileService;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentGradeRepository gradeRepository;
    private final GroupAssignmentRepository groupAssignmentRepository;
    private final FileService fileService;

    @Transactional
    public SubmissionResponseDTO submitAssignment(UUID groupAssignmentId, SubmissionRequest request, MultipartFile file, User student) {
        GroupAssignment deployment = groupAssignmentRepository.findById(groupAssignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment deployment not found"));
        
        Assignment template = deployment.getAssignment();

        // Check if deployment is closed
        if (deployment.getStatus() == GroupAssignment.GroupAssignmentStatus.CLOSED) {
            throw new RuntimeException("Bài tập này đã đóng trong nhóm này!");
        }

        // Check assigned_at
        if (deployment.getAssignedAt() != null && deployment.getAssignedAt().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Bài tập này chưa đến thời gian giao bài!");
        }

        // Check due_at and allow_late
        boolean isLate = LocalDateTime.now().isAfter(deployment.getDueAt());
        if (isLate && !deployment.isAllowLate()) {
            throw new RuntimeException("Đã quá hạn nộp bài!");
        }

        // Get current attempt number
        long count = submissionRepository.countByGroupAssignment_IdAndStudent_Id(groupAssignmentId, student.getId());
        int attemptNumber = (int) count + 1;

        AssignmentSubmission submission = AssignmentSubmission.builder()
                .groupAssignment(deployment)
                .student(student)
                .submissionType(request.getSubmissionType() != null ? request.getSubmissionType() : template.getSubmissionType())
                .textContent(request.getTextContent())
                .late(isLate)
                .attemptNumber(attemptNumber)
                .submittedAt(LocalDateTime.now())
                .build();

        // Handle File upload
        if (file != null && !file.isEmpty()) {
            // Check allowed file types
            String originalFileName = file.getOriginalFilename();
            if (template.getAllowedFileTypes() != null && !template.getAllowedFileTypes().isEmpty()) {
                String ext = "";
                if (originalFileName != null && originalFileName.contains(".")) {
                    ext = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
                }
                if (!template.getAllowedFileTypes().toLowerCase().contains(ext)) {
                    throw new RuntimeException("Định dạng file không được phép! Chỉ nhận: " + template.getAllowedFileTypes());
                }
            }

            // Check file size
            if (file.getSize() > (long) template.getMaxFileSizeMb() * 1024 * 1024) {
                throw new RuntimeException("Dung lượng file vượt quá giới hạn " + template.getMaxFileSizeMb() + "MB!");
            }

            String fileKey = fileService.uploadFile(file);
            submission.setFileKey(fileKey);
            submission.setFileName(originalFileName);
            submission.setFileSize((int) file.getSize());
        }

        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponseDTO> getMySubmissions(UUID groupAssignmentId, User student) {
        return submissionRepository.findByGroupAssignment_IdAndStudent_Id(groupAssignmentId, student.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubmissionResponseDTO updateSubmission(UUID submissionId, SubmissionRequest request, MultipartFile file, User student) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bài nộp này!");
        }

        if (gradeRepository.findBySubmission_Id(submissionId).isPresent()) {
            throw new RuntimeException("Không thể chỉnh sửa bài nộp đã được chấm điểm!");
        }

        GroupAssignment deployment = submission.getGroupAssignment();
        Assignment template = deployment.getAssignment();

        if (deployment.getStatus() == GroupAssignment.GroupAssignmentStatus.CLOSED) {
            throw new RuntimeException("Bài tập này đã đóng!");
        }

        // Check due_at and allow_late
        boolean isLate = LocalDateTime.now().isAfter(deployment.getDueAt());
        if (isLate && !deployment.isAllowLate()) {
            throw new RuntimeException("Đã quá hạn nộp bài!");
        }

        submission.setTextContent(request.getTextContent());
        submission.setLate(isLate);
        submission.setSubmittedAt(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            // Check allowed file types
            String originalFileName = file.getOriginalFilename();
            if (template.getAllowedFileTypes() != null && !template.getAllowedFileTypes().isEmpty()) {
                String ext = "";
                if (originalFileName != null && originalFileName.contains(".")) {
                    ext = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
                }
                if (!template.getAllowedFileTypes().toLowerCase().contains(ext)) {
                    throw new RuntimeException("Định dạng file không được phép! Chỉ nhận: " + template.getAllowedFileTypes());
                }
            }

            // Check file size
            if (file.getSize() > (long) template.getMaxFileSizeMb() * 1024 * 1024) {
                throw new RuntimeException("Dung lượng file vượt quá giới hạn " + template.getMaxFileSizeMb() + "MB!");
            }

            // Delete old file if exists
            if (submission.getFileKey() != null) {
                fileService.deleteFile(submission.getFileKey());
            }

            String fileKey = fileService.uploadFile(file);
            submission.setFileKey(fileKey);
            submission.setFileName(originalFileName);
            submission.setFileSize((int) file.getSize());
        }

        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteSubmission(UUID submissionId, User student) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!submission.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa bài nộp này!");
        }

        if (gradeRepository.findBySubmission_Id(submissionId).isPresent()) {
            throw new RuntimeException("Không thể xóa bài nộp đã được chấm điểm!");
        }

        // Delete file from S3/Minio
        if (submission.getFileKey() != null) {
            fileService.deleteFile(submission.getFileKey());
        }

        submissionRepository.delete(submission);
    }

    @Transactional(readOnly = true)
    public SubmissionResponseDTO getSubmissionDetails(UUID submissionId) {
        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        return mapToDTO(sub);
    }

    private SubmissionResponseDTO mapToDTO(AssignmentSubmission sub) {
        SubmissionResponseDTO dto = SubmissionResponseDTO.fromEntity(sub);
        
        // Populate file URL
        if (sub.getFileKey() != null) {
            dto.setFileUrl("/api/files/download/" + sub.getFileKey() + (sub.getFileName() != null ? "?fileName=" + sub.getFileName() : ""));
        }

        // Populate grade info
        gradeRepository.findBySubmission_Id(sub.getId()).ifPresent(grade -> {
            dto.setScore(grade.getScore());
            dto.setFeedback(grade.getFeedback());
            dto.setGradeStatus(grade.getStatus().name());
        });

        return dto;
    }
}
