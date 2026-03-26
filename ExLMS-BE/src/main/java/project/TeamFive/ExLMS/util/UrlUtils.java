package project.TeamFive.ExLMS.util;

public class UrlUtils {
    /**
     * Normalizes CKEditor resource URLs by converting absolute URLs to relative paths.
     * This ensures portability across different environments (local vs production).
     * 
     * @param content The HTML content from CKEditor
     * @return Content with relative resource URLs
     */
    public static String normalizeCkeUrls(String content) {
        if (content == null) return null;
        // Replace absolute URLs (with domain/IP and port) to /api/cke/resources/
        // Pattern matches: http(s)://[anything]/api/cke/resources/
        // Using [^"'>\s]+ to match the host part safely within HTML tags
        return content.replaceAll("https?://[^/]+/api/cke/resources/", "/api/cke/resources/");
    }
}
