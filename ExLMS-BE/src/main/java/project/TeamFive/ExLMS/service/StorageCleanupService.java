package project.TeamFive.ExLMS.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageCleanupService {

    private final FileService fileService;
    private final EntityManager entityManager;

    /**
     * Chạy định kỳ vào 2 giờ sáng mỗi ngày để dọn dẹp tài nguyên thừa.
     * Cron: giây phút giờ ngày tháng thứ
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional(readOnly = true)
    public void cleanupUnusedAssets() {
        log.info("[Cleanup] Bắt đầu tiến trình dọn dẹp bộ nhớ định kỳ...");
        long startTime = System.currentTimeMillis();

        cleanupFileBucket();
        cleanupResourceBucket();

        long endTime = System.currentTimeMillis();
        log.info("[Cleanup] Hoàn tất dọn dẹp bộ nhớ trong {} ms", (endTime - startTime));
    }

    private void cleanupFileBucket() {
        String bucket = fileService.getBucketName();
        log.info("[Cleanup] Đang kiểm tra bucket file: {}", bucket);

        List<String> minioObjects = fileService.listObjects(bucket);
        if (minioObjects.isEmpty()) return;

        Set<String> dbKeys = new HashSet<>();

        // Thu thập tất cả các key từ các bảng liên quan
        dbKeys.addAll(fetchSingleColumn("users", "avatar_key"));
        dbKeys.addAll(fetchSingleColumn("courses", "thumbnail_key"));
        dbKeys.addAll(fetchSingleColumn("study_groups", "cover_key"));
        dbKeys.addAll(fetchSingleColumn("meetings", "cover_image_key"));
        dbKeys.addAll(fetchSingleColumn("meetings", "recording_key"));
        dbKeys.addAll(fetchSingleColumn("group_collabs", "cover_image_key"));
        dbKeys.addAll(fetchSingleColumn("assignment_submissions", "file_key"));
        dbKeys.addAll(fetchSingleColumn("assignments", "cover_image_key"));
        dbKeys.addAll(fetchSingleColumn("forum_attachments", "object_key"));
        dbKeys.addAll(fetchSingleColumn("course_lessons", "resource_key"));
        dbKeys.addAll(fetchSingleColumn("quizzes", "cover_image_key"));

        int deletedCount = 0;
        for (String objectKey : minioObjects) {
            if (!dbKeys.contains(objectKey)) {
                // Kiểm tra xem file có phải là file mặc định không (không nên xóa)
                if (objectKey.contains("Default")) continue;

                log.info("[Cleanup] Xóa file không dùng: bucket={}, key={}", bucket, objectKey);
                fileService.removeObject(bucket, objectKey);
                deletedCount++;
            }
        }
        log.info("[Cleanup] Đã dọn dẹp {} file lỗi thời trong bucket {}", deletedCount, bucket);
    }

    private void cleanupResourceBucket() {
        String bucket = fileService.getResourceBucket();
        log.info("[Cleanup] Đang kiểm tra bucket tài nguyên (CKEditor): {}", bucket);

        List<String> minioObjects = fileService.listObjects(bucket);
        if (minioObjects.isEmpty()) return;

        Set<String> dbKeys = new HashSet<>();

        // Quét nội dung HTML từ các bảng CKEditor hỗ trợ
        dbKeys.addAll(extractKeysFromHtml("course_lessons", "content"));
        dbKeys.addAll(extractKeysFromHtml("courses", "description"));
        dbKeys.addAll(extractKeysFromHtml("study_groups", "description"));
        dbKeys.addAll(extractKeysFromHtml("meetings", "description"));
        dbKeys.addAll(extractKeysFromHtml("group_collabs", "description"));
        dbKeys.addAll(extractKeysFromHtml("forum_posts", "content"));
        dbKeys.addAll(extractKeysFromHtml("forum_comments", "content"));
        dbKeys.addAll(extractKeysFromHtml("group_comments", "content"));

        int deletedCount = 0;
        for (String objectKey : minioObjects) {
            if (!dbKeys.contains(objectKey)) {
                log.info("[Cleanup] Xóa tài nguyên CKEditor không dùng: bucket={}, key={}", bucket, objectKey);
                fileService.removeObject(bucket, objectKey);
                deletedCount++;
            }
        }
        log.info("[Cleanup] Đã dọn dẹp {} tài nguyên CKEditor lỗi thời trong bucket {}", deletedCount, bucket);
    }

    @SuppressWarnings("unchecked")
    private Set<String> fetchSingleColumn(String tableName, String columnName) {
        Set<String> keys = new HashSet<>();
        try {
            String sql = String.format("SELECT %s FROM %s WHERE %s IS NOT NULL", columnName, tableName, columnName);
            List<String> results = entityManager.createNativeQuery(sql).getResultList();
            for (String r : results) {
                if (r != null && !r.trim().isEmpty()) {
                    keys.add(r.trim());
                }
            }
        } catch (Exception e) {
            log.warn("[Cleanup] Lỗi khi lấy dữ liệu từ bảng {}.{}: {}", tableName, columnName, e.getMessage());
        }
        return keys;
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractKeysFromHtml(String tableName, String columnName) {
        Set<String> keys = new HashSet<>();
        try {
            String sql = String.format("SELECT %s FROM %s WHERE %s IS NOT NULL AND %s LIKE '%%/api/cke/resources/%%'", 
                columnName, tableName, columnName, columnName);
            List<String> results = entityManager.createNativeQuery(sql).getResultList();
            
            // Regex để tìm objectKey trong URL dạng /api/cke/resources/UUID_filename.ext
            Pattern pattern = Pattern.compile("/api/cke/resources/([^\"'\\s>]+)");
            
            for (String html : results) {
                if (html == null) continue;
                Matcher matcher = pattern.matcher(html);
                while (matcher.find()) {
                    keys.add(matcher.group(1));
                }
            }
        } catch (Exception e) {
            log.warn("[Cleanup] Lỗi khi quét HTML từ bảng {}.{}: {}", tableName, columnName, e.getMessage());
        }
        return keys;
    }
}
