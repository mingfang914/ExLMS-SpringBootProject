package project.TeamFive.ExLMS.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import project.TeamFive.ExLMS.user.entity.Role;
import project.TeamFive.ExLMS.user.entity.User;
import project.TeamFive.ExLMS.user.repository.UserRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final io.minio.MinioClient minioClient;

    @org.springframework.beans.factory.annotation.Value("${minio.bucket-name}")
    private String bucketName;

    @Override
    public void run(String... args) throws Exception {
        seedAssets();
        seedUsers();
    }

    private void seedAssets() {
        String[] assets = {
            "AssignmentDefaultCover.jpg",
            "CollabDefaultCover.png",
            "DefaultAvatar.png",
            "DefaultCourseImg.png",
            "DefaultGroupCover.png",
            "MeetingDefaultCover.png",
            "QuizDefaultCover.png"
        };

        // Try to find Assets directory
        java.io.File assetsDir = new java.io.File("Assets");
        if (!assetsDir.exists()) {
             assetsDir = new java.io.File("../Assets"); // Try parent if running from subdomain
        }

        if (!assetsDir.exists()) {
            log.warn("Assets directory not found, skipping asset seeding (Path checked: {})", assetsDir.getAbsolutePath());
            return;
        }

        // Retry logic for Minio connection
        int maxRetries = 5;
        int retryCount = 0;
        boolean connected = false;

        while (retryCount < maxRetries && !connected) {
            try {
                // Quick check if bucket exists or minio is reachable
                minioClient.bucketExists(io.minio.BucketExistsArgs.builder().bucket(bucketName).build());
                connected = true;
            } catch (Exception e) {
                retryCount++;
                log.warn("Minio not ready yet, retrying in 2s... ({}/{})", retryCount, maxRetries);
                try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
            }
        }

        if (!connected) {
            log.error("Could not connect to Minio after {} retries, skipping asset seeding", maxRetries);
            return;
        }

        for (String assetName : assets) {
            String objectKey = "Assets/" + assetName;
            try {
                // Check if already exists
                boolean exists = true;
                try {
                    minioClient.statObject(io.minio.StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build());
                } catch (Exception e) {
                    exists = false;
                }

                if (!exists) {
                    java.io.File file = new java.io.File(assetsDir, assetName);
                    if (file.exists()) {
                        try (java.io.FileInputStream fis = new java.io.FileInputStream(file)) {
                            minioClient.putObject(io.minio.PutObjectArgs.builder()
                                    .bucket(bucketName)
                                    .object(objectKey)
                                    .stream(fis, file.length(), -1)
                                    .contentType(java.nio.file.Files.probeContentType(file.toPath()))
                                    .build());
                            log.info("Seeded default asset: {}", objectKey);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Failed to seed asset {}: {}", assetName, e.getMessage());
            }
        }
    }

    private void seedUsers() {
        // Seed Admin
        if (!userRepository.existsByEmail("admin@exlms.com")) {
            User admin = User.builder()
                    .email("admin@exlms.com")
                    .fullName("Administrator")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .avatarKey("Assets/DefaultAvatar.png")
                    .role(Role.ADMIN)
                    .status("ACTIVE")
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default admin account: admin@exlms.com / Admin@123");
        }

        // Seed Instructor
        if (!userRepository.existsByEmail("instructor@exlms.com")) {
            User instructor = User.builder()
                    .email("instructor@exlms.com")
                    .fullName("Default Instructor")
                    .passwordHash(passwordEncoder.encode("Instructor@123"))
                    .avatarKey("Assets/DefaultAvatar.png")
                    .role(Role.INSTRUCTOR)
                    .status("ACTIVE")
                    .emailVerified(true)
                    .build();
            userRepository.save(instructor);
            log.info("Created default instructor account: instructor@exlms.com / Instructor@123");
        }

        // Seed Student
        if (!userRepository.existsByEmail("student@exlms.com")) {
            User student = User.builder()
                    .email("student@exlms.com")
                    .fullName("Default Student")
                    .avatarKey("Assets/DefaultAvatar.png")
                    .passwordHash(passwordEncoder.encode("Student@123"))
                    .role(Role.STUDENT)
                    .status("ACTIVE")
                    .emailVerified(true)
                    .build();
            userRepository.save(student);
            log.info("Created default student account: student@exlms.com / Student@123");
        }
    }
}
