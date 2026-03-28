package project.TeamFive.ExLMS.calendar.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.calendar.dto.response.CalendarEventResponse;
import project.TeamFive.ExLMS.calendar.service.CalendarService;
import project.TeamFive.ExLMS.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Slf4j
public class CalendarController {

    private final CalendarService calendarService;

    // Log to confirm controller is loaded
    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("CALENDAR_DEBUG: CalendarController initialized at /api/calendar");
    }

    @GetMapping
    public ResponseEntity<List<CalendarEventResponse>> getMyEvents(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        log.info("CALENDAR_DEBUG: Fetching events for user: {}", user.getId());
        List<CalendarEventResponse> events = calendarService.getUserEvents(user.getId(), start, end);
        return ResponseEntity.ok()
                .header("X-Debug-Version", "3.1")
                .body(events);
    }

    @GetMapping("/sync-all")
    public ResponseEntity<String> syncAll() {
        log.info("CALENDAR_DEBUG: Manual sync triggered via GET /api/calendar/sync-all");
        calendarService.syncAllExistingAssignments();
        return ResponseEntity.ok("Synchronization triggered successfully");
    }

    @GetMapping("/diagnostics")
    public ResponseEntity<Map<String, Object>> getDiagnostics() {
        log.info("CALENDAR_DEBUG: Diagnostics requested via GET /api/calendar/diagnostics");
        return ResponseEntity.ok(calendarService.getDiagnostics());
    }
}
