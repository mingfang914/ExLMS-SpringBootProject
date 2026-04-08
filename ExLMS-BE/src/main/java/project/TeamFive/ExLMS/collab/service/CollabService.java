package project.TeamFive.ExLMS.collab.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import project.TeamFive.ExLMS.collab.dto.request.CollabRequestDTO;
import project.TeamFive.ExLMS.collab.dto.request.CollabUpdateRequestDTO;
import project.TeamFive.ExLMS.collab.dto.response.CollabResponseDTO;
import project.TeamFive.ExLMS.collab.entity.CollabParticipant;
import project.TeamFive.ExLMS.collab.entity.GroupCollab;
import project.TeamFive.ExLMS.collab.repository.CollabParticipantRepository;
import project.TeamFive.ExLMS.collab.repository.GroupCollabRepository;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollabService {

    private final GroupCollabRepository collabRepository;
    private final CollabParticipantRepository participantRepository;
    private final StudyGroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    private void requireInstructorRole(StudyGroup group, User user) {
        if (user.getRole().name().equals("ADMIN")) return;
        GroupMember member = groupMemberRepository.findByGroupAndUser(group, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Không phải thành viên nhóm"));
        if (!member.getRole().equals("OWNER") && !member.getRole().equals("EDITOR")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Yêu cầu quyền giảng viên/quản lý");
        }
    }

    private void requireMemberRole(StudyGroup group, User user) {
        if (user.getRole().name().equals("ADMIN")) return;
        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không phải thành viên nhóm");
        }
    }

    @Transactional
    public CollabResponseDTO createCollab(UUID groupId, CollabRequestDTO dto, User user) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm"));
        requireInstructorRole(group, user);

        GroupCollab collab = GroupCollab.builder()
                .group(group)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .coverImageUrl(dto.getCoverImageUrl() != null ? dto.getCoverImageUrl() : "http://localhost:9000/exlms-files/Assets/CollabDefaultCover.png")
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .status(GroupCollab.CollabStatus.DRAFT)
                .documentData("{}") // Initialize with empty object or Yjs structure if needed
                .build();

        return CollabResponseDTO.fromEntity(collabRepository.save(collab));
    }

    @Transactional
    public CollabResponseDTO updateCollab(UUID collabId, CollabUpdateRequestDTO dto, User user) {
        GroupCollab collab = collabRepository.findById(collabId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Collab"));
        requireInstructorRole(collab.getGroup(), user);

        if (collab.getStatus() == GroupCollab.CollabStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể sửa phiên Collab đã kết thúc");
        }

        collab.setTitle(dto.getTitle());
        collab.setDescription(dto.getDescription());
        collab.setEndAt(dto.getEndAt());

        return CollabResponseDTO.fromEntity(collabRepository.save(collab));
    }

    @Transactional
    public CollabResponseDTO updateStatus(UUID collabId, GroupCollab.CollabStatus status, User user) {
        GroupCollab collab = collabRepository.findById(collabId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Collab"));
        requireInstructorRole(collab.getGroup(), user);

        collab.setStatus(status);
        return CollabResponseDTO.fromEntity(collabRepository.save(collab));
    }

    @Transactional(readOnly = true)
    public List<CollabResponseDTO> getCollabsByGroup(UUID groupId, User user) {
        StudyGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhóm"));

        boolean isInstructor = false;
        if (user.getRole().name().equals("ADMIN")) {
            isInstructor = true;
        } else {
            GroupMember member = groupMemberRepository.findByGroupAndUser(group, user).orElse(null);
            if (member != null && (member.getRole().equals("OWNER") || member.getRole().equals("EDITOR"))) {
                isInstructor = true;
            } else if (member == null) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không phải thành viên nhóm");
            }
        }

        boolean finalIsInstructor = isInstructor;
        return collabRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
                .filter(collab -> finalIsInstructor || collab.getStatus() != GroupCollab.CollabStatus.DRAFT)
                .map(CollabResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CollabResponseDTO getCollabById(UUID collabId, User user) {
        GroupCollab collab = collabRepository.findById(collabId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Collab"));
        requireMemberRole(collab.getGroup(), user);

        // Additional read check for draft
        if (collab.getStatus() == GroupCollab.CollabStatus.DRAFT) {
            requireInstructorRole(collab.getGroup(), user);
        }

        return CollabResponseDTO.fromEntity(collab);
    }

    @Transactional
    public void deleteCollab(UUID collabId, User user) {
        GroupCollab collab = collabRepository.findById(collabId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Collab"));
        requireInstructorRole(collab.getGroup(), user);

        if (collab.getStatus() == GroupCollab.CollabStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể xóa phiên Collab đã kết thúc để bảo quản dữ liệu");
        }

        collabRepository.delete(collab);
    }

    @Transactional
    public void trackParticipant(UUID collabId, User user) {
        GroupCollab collab = collabRepository.findById(collabId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Collab"));
        
        participantRepository.findByCollabIdAndUserId(collabId, user.getId()).ifPresentOrElse(
                participant -> {
                    participant.setLastActiveAt(LocalDateTime.now());
                    participantRepository.save(participant);
                },
                () -> {
                    CollabParticipant participant = CollabParticipant.builder()
                            .collab(collab)
                            .user(user)
                            .build();
                    participantRepository.save(participant);
                }
        );
    }

    // INTERNAL API FOR HOCUSPOCUS SERVER
    @Transactional
    public void syncDocumentData(UUID collabId, String documentData) {
        GroupCollab collab = collabRepository.findById(collabId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Collab"));
        if (collab.getStatus() != GroupCollab.CollabStatus.CLOSED) {
            collab.setDocumentData(documentData);
            collabRepository.save(collab);
        }
    }
}
