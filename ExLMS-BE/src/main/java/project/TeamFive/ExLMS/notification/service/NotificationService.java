package project.TeamFive.ExLMS.notification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.notification.dto.response.NotificationResponseDTO;
import project.TeamFive.ExLMS.notification.entity.Notification;
import project.TeamFive.ExLMS.notification.repository.NotificationRepository;
import project.TeamFive.ExLMS.service.EmailService;
import project.TeamFive.ExLMS.group.repository.GroupMemberRepository;
import project.TeamFive.ExLMS.group.entity.StudyGroup;
import project.TeamFive.ExLMS.group.entity.GroupMember;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(NotificationResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(UUID id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByRecipientAndReadFalse(user);
        LocalDateTime now = LocalDateTime.now();
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void createNotification(User recipient, String title, String body, Notification.NotificationType type,
            String actionUrl, UUID sourceEntityId, String sourceEntityType) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .body(body)
                .type(type)
                .actionUrl(actionUrl)
                .sourceEntityId(sourceEntityId)
                .sourceEntityType(sourceEntityType)
                .build();
        notification = notificationRepository.save(notification);

        // Gửi qua WebSocket (Real-time Toast)
        NotificationResponseDTO response = NotificationResponseDTO.fromEntity(notification);
        messagingTemplate.convertAndSendToUser(
                recipient.getId().toString(),
                "/queue/notifications",
                response);
    }

    /**
     * Phát bản tin tới toàn bộ User đang xem nhóm để cập nhật UI realtime.
     */
    public void broadcastResourceStatus(UUID id, String type, String status) {
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("id", id);
        data.put("type", type);
        data.put("status", status);

        java.util.Map<String, Object> message = new java.util.HashMap<>();
        message.put("type", "STATUS_CHANGED");
        message.put("data", data);

        messagingTemplate.convertAndSend("/topic/resource-status", message);
    }

    /**
     * Thông báo cho toàn bộ thành viên trong nhóm khi có nội dung mới được
     * PUBLISHED.
     */
    @Async
    @Transactional
    public void notifyGroupPublishedItem(StudyGroup group, String typeStr, String title, String status, UUID entityId,
            String path) {
        // 1. Luôn Phát bản tin để UI đang mở tự refresh
        broadcastResourceStatus(entityId, typeStr, status);

        // Chỉ gửi thông báo Toast/Email khi trạng thái là PUBLISHED
        if (!"PUBLISHED".equals(status)) {
            return;
        }

        // 2. Lấy danh sách thành viên ACTIVE
        List<GroupMember> members = groupMemberRepository.findByGroup_Id(group.getId()).stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .collect(Collectors.toList());

        if (members.isEmpty())
            return;

        Notification.NotificationType notificationType = Notification.NotificationType.SYSTEM;
        if ("Bài tập".equalsIgnoreCase(typeStr))
            notificationType = Notification.NotificationType.NEW_ASSIGNMENT;
        else if ("Bài kiểm tra".equalsIgnoreCase(typeStr))
            notificationType = Notification.NotificationType.NEW_QUIZ;
        else if ("Khóa học".equalsIgnoreCase(typeStr))
            notificationType = Notification.NotificationType.NEW_COURSE;
        else if ("Buổi họp".equalsIgnoreCase(typeStr) || "Meeting".equalsIgnoreCase(typeStr))
            notificationType = Notification.NotificationType.NEW_MEETING;
        else if ("COLLAB".equalsIgnoreCase(typeStr)) {
            notificationType = Notification.NotificationType.NEW_COLLAB;
            typeStr = "Bài tập nhóm";
        }

        String body = String.format("Một %s mới đã được đăng trong nhóm %s: %s", typeStr, group.getName(), title);
        String actionUrl = "/groups/" + group.getId() + (path != null ? path : "");

        for (GroupMember member : members) {
            createNotification(
                    member.getUser(),
                    "Thông báo " + typeStr,
                    body,
                    notificationType,
                    actionUrl,
                    entityId,
                    typeStr);
        }

        // Gửi Email thông báo
        List<String> emails = members.stream()
                .map(m -> m.getUser().getEmail())
                .collect(Collectors.toList());

        emailService.sendNotificationToGroupMembers(emails, group.getName(), typeStr, title);
    }
}
