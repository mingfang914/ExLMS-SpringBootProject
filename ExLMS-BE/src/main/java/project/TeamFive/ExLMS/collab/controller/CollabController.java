package project.TeamFive.ExLMS.collab.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.collab.dto.request.CollabRequestDTO;
import project.TeamFive.ExLMS.collab.dto.request.CollabStatusUpdateDTO;
import project.TeamFive.ExLMS.collab.dto.request.CollabUpdateRequestDTO;
import project.TeamFive.ExLMS.collab.dto.response.CollabResponseDTO;
import project.TeamFive.ExLMS.collab.service.CollabService;
import project.TeamFive.ExLMS.user.entity.User;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class CollabController {

    private final CollabService collabService;

    // Group context
    @PostMapping("/groups/{groupId}/collabs")
    public ResponseEntity<CollabResponseDTO> createCollab(
            @PathVariable UUID groupId,
            @RequestBody @Valid CollabRequestDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collabService.createCollab(groupId, dto, user));
    }

    @GetMapping("/groups/{groupId}/collabs")
    public ResponseEntity<List<CollabResponseDTO>> getCollabsByGroup(
            @PathVariable UUID groupId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(collabService.getCollabsByGroup(groupId, user));
    }

    // Collab context
    @GetMapping("/collabs/{id}")
    public ResponseEntity<CollabResponseDTO> getCollab(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(collabService.getCollabById(id, user));
    }

    @PutMapping("/collabs/{id}")
    public ResponseEntity<CollabResponseDTO> updateCollab(
            @PathVariable UUID id,
            @RequestBody @Valid CollabUpdateRequestDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(collabService.updateCollab(id, dto, user));
    }

    @PutMapping("/collabs/{id}/status")
    public ResponseEntity<CollabResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody @Valid CollabStatusUpdateDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(collabService.updateStatus(id, dto.getStatus(), user));
    }

    @DeleteMapping("/collabs/{id}")
    public ResponseEntity<Void> deleteCollab(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        collabService.deleteCollab(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/collabs/{id}/track")
    public ResponseEntity<Void> trackParticipant(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        collabService.trackParticipant(id, user);
        return ResponseEntity.ok().build();
    }

    // Internal endpoint for Node.js Hocuspocus server
    @PostMapping("/collabs/internal/{id}/sync")
    public ResponseEntity<Void> internalSyncDocument(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {
        // In a real microservice architecture, we'd secure this endpoint with an internal API KEY or Mutual TLS
        collabService.syncDocumentData(id, payload.get("documentData"));
        return ResponseEntity.ok().build();
    }
}
