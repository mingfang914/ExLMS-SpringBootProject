package project.TeamFive.ExLMS.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${MAIL_FROM:no-reply@exlms.com}")
    private String fromEmail;

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    @Async
    public void sendPasswordResetEmail(String to, String resetUrl) throws MessagingException {
        String subject = "Reset Your ExLMS Password";
        String htmlContent = String.format(
            "<html>" +
            "<body>" +
            "  <h2>Password Reset Request</h2>" +
            "  <p>Hello,</p>" +
            "  <p>You requested to reset your password for ExLMS. Please click the button below to proceed:</p>" +
            "  <a href=\"%s\" style=\"background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Reset Password</a>" +
            "  <p>If you did not request this, please ignore this email.</p>" +
            "  <p>This link will expire in 1 hour.</p>" +
            "  <br/>" +
            "  <p>Standard ExLMS Team</p>" +
            "</body>" +
            "</html>",
            resetUrl
        );

        sendHtmlEmail(to, subject, htmlContent);
    }

    @Async
    public void sendNotificationToGroupMembers(List<String> recipients, String groupName, String type, String title) {
        if (recipients == null || recipients.isEmpty()) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(fromEmail); // Thêm người nhận To để tránh lỗi một số mail server không cho để trống
            helper.setSubject("[ExLMS] Thông báo: " + type + " mới trong nhóm " + groupName);

            // Gửi BCC để bảo mật danh sách email
            helper.setBcc(recipients.toArray(new String[0]));

            String htmlContent = String.format(
                "<html>" +
                "<body>" +
                "  <h3>Thông báo từ nhóm: %s</h3>" +
                "  <p>Chào bạn,</p>" +
                "  <p>Một <b>%s</b> mới vừa được tạo: <b>%s</b></p>" +
                "  <p>Hãy đăng nhập vào ExLMS để kiểm tra ngay nhé!</p>" +
                "  <br/>" +
                "  <p>Trân trọng,<br/>Đội ngũ ExLMS</p>" +
                "</body>" +
                "</html>",
                groupName, type, title
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi mail thông báo: " + e.getMessage());
        }
    }
}
