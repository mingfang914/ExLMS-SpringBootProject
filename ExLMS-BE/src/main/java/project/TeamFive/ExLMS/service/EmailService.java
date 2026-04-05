package project.TeamFive.ExLMS.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendNotificationToGroupMembers(List<String> emails, String groupName, String type, String title) {
        if (emails == null || emails.isEmpty()) return;
        
        String subject = String.format("ExLMS: Thông báo %s mới trong nhóm %s", type, groupName);
        String body = String.format(
            "<div style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #1F2937; line-height: 1.6;'>" +
            "  <div style='background: linear-gradient(135deg, #6366F1, #22D3EE); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;'>" +
            "    <h1 style='color: white; margin: 0; font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);'>Thông báo %s mới</h1>" +
            "  </div>" +
            "  <div style='padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px; background-color: #FFFFFF;'>" +
            "    <p style='font-size: 16px;'>Xin chào thành viên nhóm <b>%s</b>,</p>" +
            "    <p>Một %s mới với tiêu đề <span style='color: #4F46E5; font-weight: 700;'>\"%s\"</span> vừa được đăng tải bởi giảng viên.</p>" +
            "    <p>Hãy dành thời gian truy cập vào hệ thống ExLMS để xem chi tiết và không bỏ lỡ các nội dung học tập quan trọng.</p>" +
            "    <div style='text-align: center; margin: 40px 0;'>" +
            "      <a href='%s' style='display: inline-block; background: #6366F1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; box-shadow: 0 4px 15px rgba(99,102,241,0.3);'>Truy cập ngay</a>" +
            "    </div>" +
            "    <p style='color: #6B7280; font-size: 14px;'>Chúc bạn có một ngày học tập hiệu quả!</p>" +
            "    <hr style='border: none; border-top: 1px solid #F3F4F6; margin: 30px 0;'>" +
            "    <p style='color: #9CA3AF; font-size: 12px; text-align: center;'>&copy; 2026 Đội ngũ ExLMS Learning Platform</p>" +
            "  </div>" +
            "</div>",
            type, groupName, type, title, frontendUrl
        );

        sendHtmlEmail(emails, subject, body);
    }

    @Async
    public void sendForgotPasswordEmail(String toEmail, String resetLink) {
        String subject = "ExLMS: Khôi phục mật khẩu";
        String body = String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
            "  <h2 style='color: #4F46E5;'>Khôi phục mật khẩu ExLMS</h2>" +
            "  <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>" +
            "  <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu. Link này sẽ hết hạn trong 30 phút.</p>" +
            "  <a href='%s' style='display: inline-block; background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Đặt lại mật khẩu</a>" +
            "  <p style='color: #6B7280; font-size: 12px; margin-top: 20px;'>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>" +
            "</div>",
            resetLink
        );

        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private void sendHtmlEmail(List<String> recipients, String subject, String body) {
        recipients.forEach(to -> sendEmail(to, subject, body));
    }
}
