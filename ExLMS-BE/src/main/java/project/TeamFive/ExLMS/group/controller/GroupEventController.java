package project.TeamFive.ExLMS.group.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.group.dto.request.GroupEventRequest;
import project.TeamFive.ExLMS.group.dto.response.GroupEventResponse;
import project.TeamFive.ExLMS.group.service.GroupEventService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/events")
@RequiredArgsConstructor
public class GroupEventController {

    private final GroupEventService groupEventService;

    @GetMapping
    public ResponseEntity<List<GroupEventResponse>> getGroupEvents(@PathVariable UUID groupId) {
        return ResponseEntity.ok(groupEventService.getGroupEvents(groupId));
    }

    @PostMapping
    public ResponseEntity<GroupEventResponse> createGroupEvent(
            @PathVariable UUID groupId,
            @Valid @RequestBody GroupEventRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupEventService.createGroupEvent(groupId, user.getId(), request));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<GroupEventResponse> updateGroupEvent(
            @PathVariable UUID groupId, // Not strictly needed but keeps RESTful structure
            @PathVariable UUID eventId,
            @Valid @RequestBody GroupEventRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(groupEventService.updateGroupEvent(eventId, user.getId(), request));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteGroupEvent(
            @PathVariable UUID groupId,
            @PathVariable UUID eventId,
            @AuthenticationPrincipal User user) {
        groupEventService.deleteGroupEvent(eventId, user.getId());
        return ResponseEntity.ok().build();
    }
}
