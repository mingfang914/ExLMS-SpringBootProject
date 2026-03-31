package project.TeamFive.ExLMS.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO nhận authorization_code từ Frontend sau khi Google redirect.
 * Phương án B: Frontend dùng @react-oauth/google (auth-code flow, postMessage mode).
 */
@Data
public class GoogleOAuth2Request {

    @NotBlank(message = "Authorization code không được để trống")
    private String code;

    @NotBlank(message = "Redirect URI không được để trống")
    private String redirectUri;
}
