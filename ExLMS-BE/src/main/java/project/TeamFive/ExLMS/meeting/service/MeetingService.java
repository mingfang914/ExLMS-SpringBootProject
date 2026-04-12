package project.TeamFive.ExLMS.meeting.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.meeting.dto.request.CreateMeetingRequest;
import project.TeamFive.ExLMS.meeting.dto.response.MeetingResponseDTO;
import project.TeamFive.ExLMS.meeting.entity.Meeting;
import project.TeamFive.ExLMS.meeting.repository.MeetingRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.meeting.event.MeetingCanceledEvent;
import project.TeamFive.ExLMS.meeting.event.MeetingScheduledEvent;
import project.TeamFive.ExLMS.meeting.event.MeetingUpdatedEvent;
import project.TeamFive.ExLMS.meeting.dto.request.CreatePollRequest;
import project.TeamFive.ExLMS.meeting.dto.request.QuestionRequest;
import project.TeamFive.ExLMS.meeting.dto.response.*;
import project.TeamFive.ExLMS.meeting.entity.*;
import project.TeamFive.ExLMS.meeting.repository.*;
import project.TeamFive.ExLMS.service.FileService;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final MeetingAttendanceRepository attendanceRepository;
    private final MeetingQuestionRepository questionRepository;
    private final MeetingPollRepository pollRepository;
    private final MeetingPollOptionRepository pollOptionRepository;
    private final MeetingPollVoteRepository pollVoteRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ApplicationEventPublisher eventPublisher;
    private final project.TeamFive.ExLMS.notification.service.NotificationService notificationService;
    private final FileService fileService;

    private void broadcast(UUID meetingId, String type, Object data) {
        String destination = "/topic/meeting/" + meetingId;
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("type", type);
        payload.put("data", data);
        messagingTemplate.convertAndSend(destination, payload);
    }

    private void requireInstructorRole(StudyGroup group, User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập!");
        }
        GroupMember member = groupMemberRepository.findByGroup_IdAndUser_Id(group.getId(), user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Bạn không phải là thành viên của nhóm này!"));

        if (!"OWNER".equals(member.getRole()) && !"EDITOR".equals(member.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Truy cập bị từ chối: Chỉ Chủ nhóm hoặc Biên tập viên mới có quyền quản lý Buổi học trực tuyến!");
        }
    }

    @Transactional
    public MeetingResponseDTO scheduleMeeting(UUID groupId, CreateMeetingRequest request, User creator) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Study Group not found"));

        requireInstructorRole(group, creator);

        String roomName = group.getName().replaceAll("\\s+", "-").toLowerCase() + "-" + UUID.randomUUID().toString().substring(0, 8);
        String joinUrl = roomName; // For LiveKit, we just need the room name

        Meeting meeting = Meeting.builder()
                .group(group)
                .createdBy(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .coverImageKey(request.getCoverImageKey() != null ? request.getCoverImageKey() : "Assets/MeetingDefaultCover.png")
                .platform("livekit")
                .joinUrl(joinUrl)
                .startAt(request.getStartAt() != null ? request.getStartAt() : LocalDateTime.now())
                .endAt(request.getEndAt() != null ? request.getEndAt() : LocalDateTime.now().plusHours(1))
                .status(request.getStatus() != null ? request.getStatus() : Meeting.MeetingStatus.DRAFT)
                .build();

        meeting = meetingRepository.save(meeting);
        
        notificationService.notifyGroupPublishedItem(
            group, "Buổi họp", meeting.getTitle(), meeting.getStatus().name(), 
            meeting.getId(), "/meetings/" + meeting.getId()
        );

        // Notify through event for calendar sync
        eventPublisher.publishEvent(new MeetingScheduledEvent(this, meeting));

        return MeetingResponseDTO.fromEntity(meeting);
    }

    @Transactional(readOnly = true)
    public List<MeetingResponseDTO> getMeetingsByGroup(UUID groupId) {
        return meetingRepository.findByGroup_IdOrderByStartAtDesc(groupId).stream()
                .map(MeetingResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MeetingResponseDTO updateMeeting(UUID id, CreateMeetingRequest request, User instructor) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (meeting.getStatus() == Meeting.MeetingStatus.CLOSED) {
            throw new RuntimeException("Không thể chỉnh sửa buổi họp đã kết thúc");
        }

        requireInstructorRole(meeting.getGroup(), instructor);

        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        if (request.getCoverImageKey() != null) meeting.setCoverImageKey(request.getCoverImageKey());
        meeting.setStartAt(request.getStartAt());
        meeting.setEndAt(request.getEndAt());
        Meeting.MeetingStatus oldStatus = meeting.getStatus();
        if (request.getStatus() != null) {
            meeting.setStatus(request.getStatus());
        }

        Meeting savedMeeting = meetingRepository.save(meeting);

        if (oldStatus == Meeting.MeetingStatus.DRAFT && savedMeeting.getStatus() == Meeting.MeetingStatus.PUBLISHED) {
            notificationService.notifyGroupPublishedItem(
                meeting.getGroup(), "Buổi họp", meeting.getTitle(), 
                savedMeeting.getStatus().name(), savedMeeting.getId(), "/meetings/" + savedMeeting.getId()
            );
        } else {
             notificationService.broadcastResourceStatus(savedMeeting.getId(), "Buổi họp", savedMeeting.getStatus().name());
        }

        // Notify through event for calendar sync update
        eventPublisher.publishEvent(new MeetingUpdatedEvent(this, savedMeeting));

        return MeetingResponseDTO.fromEntity(savedMeeting);
    }

    @Transactional
    public void deleteMeeting(UUID id, User instructor) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (meeting.getStatus() == Meeting.MeetingStatus.PUBLISHED && LocalDateTime.now().isAfter(meeting.getStartAt()) && LocalDateTime.now().isBefore(meeting.getEndAt())) {
            throw new RuntimeException("Không thể xóa buổi họp khi đang diễn ra!");
        }

        requireInstructorRole(meeting.getGroup(), instructor);

        // Notify through event for calendar sync delete
        eventPublisher.publishEvent(new MeetingCanceledEvent(this, id));

        // Delete other associated data (attendance, questions, polls etc would be
        // cascade or manual)
        // For simplicity, we assume cascading or we delete them here if needed
        meetingRepository.delete(meeting);
    }

    @Transactional
    public void startMeeting(UUID id, User instructor) {
        if (instructor == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        Meeting meeting = meetingRepository.findById(id).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);

        if (meeting.getStatus() == Meeting.MeetingStatus.CLOSED) {
            throw new RuntimeException("Buổi họp đã kết thúc.");
        }

        // Allow starting 15 minutes early or anytime during
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(meeting.getStartAt().minusMinutes(15))) {
            throw new RuntimeException(
                    "Không thể bắt đầu buổi họp quá sớm. Vui lòng quay lại trước giờ bắt đầu 15 phút.");
        }

        meeting.setStatus(Meeting.MeetingStatus.PUBLISHED);
        meetingRepository.save(meeting);
        broadcast(id, "MEETING_STARTED", null);
    }

    @Transactional
    public void endMeeting(UUID id, User instructor) {
        if (instructor == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        Meeting meeting = meetingRepository.findById(id).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);
        meeting.setStatus(Meeting.MeetingStatus.CLOSED);
        meetingRepository.save(meeting);
        broadcast(id, "MEETING_ENDED", null);
    }

    @Transactional
    public void uploadRecording(UUID id, MultipartFile file, User instructor) {
        if (instructor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập");
        }
        Meeting meeting = meetingRepository.findById(id).orElseThrow(() -> new RuntimeException("Meeting not found"));
        requireInstructorRole(meeting.getGroup(), instructor);

        try {
            String fileKey = fileService.uploadFile(file);
            meeting.setRecordingKey(fileKey);
            meetingRepository.save(meeting);
            broadcast(id, "RECORDING_AVAILABLE", MeetingResponseDTO.fromEntity(meeting));
        } catch (Exception e) {
            throw new RuntimeException("Không thể lưu bản ghi hình: " + e.getMessage());
        }
    }

    @Transactional
    public void recordAttendance(UUID meetingId, User user, boolean joining) {
        if (user == null)
            return; // Silent return for attendance if no user
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();

        MeetingAttendance attendance = attendanceRepository.findByMeeting_IdAndUser_Id(meetingId, user.getId())
                .orElse(MeetingAttendance.builder()
                        .meeting(meeting)
                        .user(user)
                        .present(true)
                        .durationSec(0)
                        .build());

        if (joining) {
            attendance.setJoinedAt(LocalDateTime.now());
            attendance.setPresent(true);
        } else {
            attendance.setLeftAt(LocalDateTime.now());
            if (attendance.getJoinedAt() != null) {
                long seconds = Duration.between(attendance.getJoinedAt(), attendance.getLeftAt()).getSeconds();
                if (seconds > 0) {
                    attendance.setDurationSec(attendance.getDurationSec() + (int) seconds);
                }
            }
        }
        attendanceRepository.save(attendance);
        broadcast(meetingId, joining ? "MEMBER_JOINED" : "MEMBER_LEFT", Map.of(
                "userId", user.getId().toString(),
                "fullName", user.getFullName(),
                "joining", joining));
    }

    @Transactional
    public QuestionResponseDTO addQuestion(UUID meetingId, QuestionRequest request, User user) {
        if (user == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        System.out.println("Adding question for meeting: " + meetingId);
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found: " + meetingId));

        MeetingQuestion question = MeetingQuestion.builder()
                .meeting(meeting)
                .user(user)
                .content(request.getContent())
                .isPrivate(request.getIsPrivate())
                .answered(false)
                .build();
        QuestionResponseDTO saved = mapToQuestionDTO(questionRepository.save(question));
        broadcast(meetingId, "QUESTION_ADDED", saved);
        return saved;
    }

    @Transactional
    public void answerQuestion(UUID questionId, String answer, User instructor) {
        MeetingQuestion question = questionRepository.findById(questionId).orElseThrow();
        requireInstructorRole(question.getMeeting().getGroup(), instructor);
        question.setAnswer(answer);
        question.setAnsweredBy(instructor);
        question.setAnswered(true);
        questionRepository.save(question);
        broadcast(question.getMeeting().getId(), "QUESTION_ANSWERED", mapToQuestionDTO(question));
    }

    @Transactional(readOnly = true)
    public List<QuestionResponseDTO> getQuestions(UUID meetingId) {
        System.out.println("Fetching questions for meeting: " + meetingId);
        return questionRepository.findByMeeting_IdOrderByCreatedAtAsc(meetingId).stream()
                .map(this::mapToQuestionDTO).collect(Collectors.toList());
    }

    @Transactional
    public PollResponseDTO createPoll(UUID meetingId, CreatePollRequest request, User instructor) {
        if (instructor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập!");
        }
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);

        MeetingPoll poll = MeetingPoll.builder()
                .meeting(meeting)
                .question(request.getQuestion())
                .active(true)
                .build();
        poll = pollRepository.save(poll);

        for (String label : request.getOptions()) {
            MeetingPollOption opt = MeetingPollOption.builder()
                    .poll(poll)
                    .label(label)
                    .voteCount(0)
                    .build();
            pollOptionRepository.save(opt);
        }
        PollResponseDTO detailed = getPollDetailed(poll.getId(), null);
        broadcast(meetingId, "POLL_CREATED", detailed);
        return detailed;
    }

    @Transactional
    public void voteInPoll(UUID pollId, UUID optionId, User user) {
        MeetingPoll poll = pollRepository.findById(pollId).orElseThrow();
        MeetingPollOption option = pollOptionRepository.findById(optionId).orElseThrow();

        MeetingPollVote.MeetingPollVoteId voteId = new MeetingPollVote.MeetingPollVoteId(pollId, user.getId());
        if (pollVoteRepository.existsById(voteId)) {
            throw new RuntimeException("You have already voted in this poll");
        }

        MeetingPollVote vote = MeetingPollVote.builder()
                .id(voteId)
                .poll(poll)
                .user(user)
                .option(option)
                .build();
        pollVoteRepository.save(vote);

        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);
        broadcast(poll.getMeeting().getId(), "POLL_UPDATED", getPollDetailed(pollId, user.getId()));
    }

    @Transactional(readOnly = true)
    public List<PollResponseDTO> getPolls(UUID meetingId, User user) {
        return pollRepository.findByMeeting_Id(meetingId).stream()
                .map(p -> getPollDetailed(p.getId(), user.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingAttendanceResponseDTO> getAttendanceReport(UUID meetingId, User instructor) {
        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();
        requireInstructorRole(meeting.getGroup(), instructor);
        
        // Use a map to consolidate any existing duplicates (just in case)
        Map<UUID, MeetingAttendanceResponseDTO> report = new java.util.HashMap<>();
        
        attendanceRepository.findByMeeting_Id(meetingId).forEach(a -> {
            MeetingAttendanceResponseDTO dto = report.getOrDefault(a.getUser().getId(), 
                MeetingAttendanceResponseDTO.builder()
                    .id(a.getId())
                    .userId(a.getUser().getId())
                    .userName(a.getUser().getFullName())
                    .joinedAt(a.getJoinedAt())
                    .leftAt(a.getLeftAt())
                    .durationSec(0)
                    .isPresent(a.isPresent())
                    .build());
            
            // Consolidate duration and keep logical status
            dto.setDurationSec(dto.getDurationSec() + a.getDurationSec());
            if (a.getLeftAt() == null) {
                dto.setLeftAt(null); // Still in meeting
            } else if (dto.getLeftAt() != null && a.getLeftAt().isAfter(dto.getLeftAt())) {
                dto.setLeftAt(a.getLeftAt());
            }
            
            report.put(a.getUser().getId(), dto);
        });
        
        return new java.util.ArrayList<>(report.values());
    }

    private QuestionResponseDTO mapToQuestionDTO(MeetingQuestion q) {
        return QuestionResponseDTO.builder()
                .id(q.getId())
                .userId(q.getUser().getId())
                .userName(q.getUser().getFullName())
                .content(q.getContent())
                .answer(q.getAnswer())
                .answeredByName(q.getAnsweredBy() != null ? q.getAnsweredBy().getFullName() : null)
                .answered(q.isAnswered())
                .isPrivate(q.isPrivate())
                .createdAt(q.getCreatedAt())
                .build();
    }

    private PollResponseDTO getPollDetailed(UUID pollId, UUID userId) {
        MeetingPoll poll = pollRepository.findById(pollId).orElseThrow();
        UUID votedOptionId = null;
        if (userId != null) {
            votedOptionId = pollVoteRepository.findById(new MeetingPollVote.MeetingPollVoteId(pollId, userId))
                    .map(v -> v.getOption().getId()).orElse(null);
        }

        return PollResponseDTO.builder()
                .id(poll.getId())
                .question(poll.getQuestion())
                .active(poll.isActive())
                .userVotedOptionId(votedOptionId)
                .options(poll.getOptions().stream()
                        .map(o -> PollResponseDTO.OptionDTO.builder()
                                .id(o.getId())
                                .label(o.getLabel())
                                .voteCount(o.getVoteCount())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public MeetingResponseDTO getMeetingById(UUID id, User user) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy buổi họp"));

        MeetingResponseDTO dto = MeetingResponseDTO.fromEntity(meeting);

        if (user != null) {
            // Find user's role in this group
            groupMemberRepository.findByGroup_IdAndUser_Id(meeting.getGroup().getId(), user.getId())
                    .ifPresent(member -> dto.setCurrentUserRole(member.getRole()));
        }

        return dto;
    }
}
