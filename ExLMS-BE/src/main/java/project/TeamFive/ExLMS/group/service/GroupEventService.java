package project.TeamFive.ExLMS.group.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.group.dto.request.GroupEventRequest;
import project.TeamFive.ExLMS.group.dto.response.GroupEventResponse;
import project.TeamFive.ExLMS.group.entity.GroupEvent;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.group.event.GroupEventCreatedEvent;
import project.TeamFive.ExLMS.group.event.GroupEventDeletedEvent;
import project.TeamFive.ExLMS.group.event.GroupEventUpdatedEvent;
import project.TeamFive.ExLMS.group.repository.GroupEventRepository;
import project.TeamFive.ExLMS.group.repository.StudyGroupRepository;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupEventService {

    private final GroupEventRepository groupEventRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<GroupEventResponse> getGroupEvents(UUID groupId) {
        return groupEventRepository.findByGroupIdOrderByStartAtAsc(groupId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupEventResponse createGroupEvent(UUID groupId, UUID userId, GroupEventRequest request) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupEvent groupEvent = GroupEvent.builder()
                .group(group)
                .createdBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .color(request.getColor() != null && !request.getColor().isEmpty() ? request.getColor() : "#6366F1")
                .build();

        groupEvent = groupEventRepository.save(groupEvent);

        // Publish event to trigger calendar sync
        eventPublisher.publishEvent(new GroupEventCreatedEvent(this, groupEvent));

        return mapToResponse(groupEvent);
    }

    @Transactional
    public GroupEventResponse updateGroupEvent(UUID eventId, UUID userId, GroupEventRequest request) {
        GroupEvent groupEvent = groupEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Group event not found"));

        // Add proper auth check here to ensure userId has permission to update.
        // Simplified for brevity.

        groupEvent.setTitle(request.getTitle());
        groupEvent.setDescription(request.getDescription());
        groupEvent.setLocation(request.getLocation());
        groupEvent.setStartAt(request.getStartAt());
        groupEvent.setEndAt(request.getEndAt());
        if (request.getColor() != null && !request.getColor().isEmpty()) {
            groupEvent.setColor(request.getColor());
        }

        groupEvent = groupEventRepository.save(groupEvent);

        // Publish event to trigger calendar sync update
        eventPublisher.publishEvent(new GroupEventUpdatedEvent(this, groupEvent));

        return mapToResponse(groupEvent);
    }

    @Transactional
    public void deleteGroupEvent(UUID eventId, UUID userId) {
        GroupEvent groupEvent = groupEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Group event not found"));

        groupEventRepository.delete(groupEvent);

        // Publish event to trigger calendar sync delete
        eventPublisher.publishEvent(new GroupEventDeletedEvent(this, eventId));
    }

    private GroupEventResponse mapToResponse(GroupEvent event) {
        return GroupEventResponse.builder()
                .id(event.getId())
                .groupId(event.getGroup().getId())
                .createdBy(event.getCreatedBy().getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startAt(event.getStartAt())
                .endAt(event.getEndAt())
                .color(event.getColor())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
