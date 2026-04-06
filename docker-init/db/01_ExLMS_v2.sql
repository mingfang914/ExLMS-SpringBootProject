-- ExLMS Database Schema Refactored (Template/Deployment Pattern)
-- v2.1 - Complete Schema Fix

CREATE DATABASE IF NOT EXISTS exlms
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE exlms;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- UTILITY FUNCTIONS
-- --------------------------------------------------------

DROP FUNCTION IF EXISTS `bin_to_uuid16`;
DROP FUNCTION IF EXISTS `uuid16_to_bin`;
DROP FUNCTION IF EXISTS `uuid_v7`;

DELIMITER $$
CREATE FUNCTION `bin_to_uuid16` (`b` BINARY(16)) RETURNS VARCHAR(36) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC NO SQL BEGIN
    DECLARE h VARCHAR(32) DEFAULT LOWER(HEX(b));
    RETURN CONCAT(
        SUBSTR(h,  1, 8), '-',
        SUBSTR(h,  9, 4), '-',
        SUBSTR(h, 13, 4), '-',
        SUBSTR(h, 17, 4), '-',
        SUBSTR(h, 21, 12)
    );
END$$

CREATE FUNCTION `uuid16_to_bin` (`s` VARCHAR(36)) RETURNS BINARY(16) DETERMINISTIC NO SQL BEGIN
    RETURN UNHEX(REPLACE(s, '-', ''));
END$$

CREATE FUNCTION `uuid_v7` () RETURNS BINARY(16) NO SQL BEGIN
    DECLARE ts      BIGINT UNSIGNED DEFAULT (UNIX_TIMESTAMP(NOW(3)) * 1000);
    DECLARE ts_hex  VARCHAR(12)     DEFAULT LPAD(HEX(ts), 12, '0');
    DECLARE rand1   VARCHAR(4)      DEFAULT LPAD(HEX(FLOOR(RAND() * 0xFFF)), 3, '0');
    DECLARE rand2   VARCHAR(16)     DEFAULT LPAD(HEX(FLOOR(RAND() * 0x3FFFFFFFFFFFFFFF)), 16, '0');
    DECLARE uuid_str VARCHAR(32) DEFAULT CONCAT(
        ts_hex,
        '7', rand1,
        SUBSTR(CONCAT('8', rand2), 1, 4),
        SUBSTR(rand2, 5, 12)
    );
    RETURN UNHEX(uuid_str);
END$$
DELIMITER ;

-- --------------------------------------------------------
-- CORE SYSTEM TABLES
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` binary(16) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `avatar_key` varchar(36) DEFAULT NULL,
  `bio` text,
  `role` enum('ADMIN','INSTRUCTOR','STUDENT') NOT NULL DEFAULT 'STUDENT',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(128) DEFAULT NULL,
  `reset_token` varchar(128) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `failed_login_count` int NOT NULL DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  FULLTEXT KEY `ft_users_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_sessions` (
  `id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `refresh_token` varchar(512) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `oauth_accounts` (
  `id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `access_token` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_oauth_provider` (`provider`,`provider_id`),
  CONSTRAINT `fk_oauth_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `study_groups` (
  `id` binary(16) NOT NULL,
  `owner_id` binary(16) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `cover_key` varchar(36) DEFAULT NULL,
  `visibility` varchar(255) NOT NULL DEFAULT 'public',
  `invite_code` varchar(20) DEFAULT NULL,
  `max_members` int NOT NULL DEFAULT '100',
  `member_count` int NOT NULL DEFAULT '1',
  `category` varchar(80) DEFAULT NULL,
  `language` varchar(10) NOT NULL DEFAULT 'vi',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `auto_approve` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_groups_invite_code` (`invite_code`),
  CONSTRAINT `fk_groups_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `group_members` (
  `id` binary(16) NOT NULL,
  `group_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'member',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `approved_by` binary(16) DEFAULT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_group_members` (`group_id`,`user_id`),
  CONSTRAINT `fk_gm_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `group_join_requests` (
  `id` binary(16) NOT NULL,
  `group_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `message` text,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `reviewed_by` binary(16) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_jr_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- LEARNING RESOURCES (Templates)
-- --------------------------------------------------------

CREATE TABLE `courses` (
  `id` binary(16) NOT NULL,
  `created_by` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `thumbnail_key` varchar(36) DEFAULT NULL,
  `completion_threshold` tinyint NOT NULL DEFAULT '80',
  `has_certificate` tinyint(1) NOT NULL DEFAULT '0',
  `certificate_key` char(36) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp. NULL = active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courses_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_courses_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_chapters` (
  `id` binary(16) NOT NULL,
  `course_id` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `order_index` int NOT NULL,
  `is_locked` tinyint(1) NOT NULL DEFAULT '0',
  `unlock_after_chapter` binary(16) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp. NULL = active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chapters_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_chapters_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_lessons` (
  `id` binary(16) NOT NULL,
  `chapter_id` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content_type` enum('VIDEO','DOCUMENT','EMBED','FILE') NOT NULL DEFAULT 'DOCUMENT',
  `content` longtext,
  `resource_key` varchar(36) DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `order_index` int NOT NULL,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp. NULL = active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessons_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_lessons_chapter` FOREIGN KEY (`chapter_id`) REFERENCES `course_chapters` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignments` (
  `id` binary(16) NOT NULL,
  `created_by` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `max_score` int NOT NULL DEFAULT '100',
  `submission_type` enum('FILE','TEXT','MIXED') NOT NULL DEFAULT 'FILE',
  `allowed_file_types` varchar(255) DEFAULT NULL,
  `max_file_size_mb` int NOT NULL DEFAULT '50',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp. NULL = active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assignments_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_asgn_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quizzes` (
  `id` binary(16) NOT NULL,
  `created_by` binary(16) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `time_limit_sec` int DEFAULT NULL,
  `max_attempts` int NOT NULL DEFAULT '1',
  `passing_score` int NOT NULL DEFAULT '50',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp. NULL = active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quizzes_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_quizzes_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_questions` (
  `id` binary(16) NOT NULL,
  `quiz_id` binary(16) NOT NULL,
  `content` text NOT NULL,
  `question_type` enum('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','FILL_BLANK') NOT NULL DEFAULT 'SINGLE_CHOICE',
  `points` int NOT NULL DEFAULT '1',
  `explanation` text,
  `order_index` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_questions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_answers` (
  `id` binary(16) NOT NULL,
  `question_id` binary(16) NOT NULL,
  `content` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `order_index` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- DEPLOYMENTS (Assigned Learning Instances)
-- --------------------------------------------------------

CREATE TABLE `group_courses` (
  `id` binary(16) NOT NULL,
  `group_id` binary(16) NOT NULL,
  `course_id` binary(16) NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `order_index` smallint NOT NULL DEFAULT '0',
  `status` enum('DRAFT','PUBLISHED','CLOSED') NOT NULL DEFAULT 'DRAFT',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_gc_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gc_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `group_assignments` (
  `id` binary(16) NOT NULL,
  `group_id` binary(16) NOT NULL,
  `assignment_id` binary(16) NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_at` datetime NOT NULL,
  `allow_late` tinyint(1) NOT NULL DEFAULT '0',
  `late_penalty_percent` int NOT NULL DEFAULT '0',
  `status` enum('DRAFT','PUBLISHED','CLOSED') NOT NULL DEFAULT 'DRAFT',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_ga_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ga_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `group_quizzes` (
  `id` binary(16) NOT NULL,
  `group_id` binary(16) NOT NULL,
  `quiz_id` binary(16) NOT NULL,
  `open_at` datetime DEFAULT NULL,
  `close_at` datetime DEFAULT NULL,
  `status` enum('DRAFT', 'PUBLISHED','CLOSED') NOT NULL DEFAULT 'DRAFT',
  `result_visibility` enum('IMMEDIATE','AFTER_DEADLINE','OPENED') NOT NULL DEFAULT 'IMMEDIATE',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_gq_group` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gq_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE TABLE `course_quizzes` (
--   `id` binary(16) NOT NULL,
--   `course_id` binary(16) NOT NULL,
--   `quiz_id` binary(16) NOT NULL,
--   `chapter_id` binary(16) DEFAULT NULL,
--   `order_index` int NOT NULL DEFAULT '0',
--   `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`id`),
--   CONSTRAINT `fk_cq_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
--   CONSTRAINT `fk_cq_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- ACADEMIC PROGRESS & SUBMISSIONS
-- --------------------------------------------------------

CREATE TABLE `course_enrollments` (
  `id` binary(16) NOT NULL,
  `group_course_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `progress_percent` int NOT NULL DEFAULT '0',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `enrolled_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollments` (`group_course_id`,`user_id`),
  CONSTRAINT `fk_enroll_gc` FOREIGN KEY (`group_course_id`) REFERENCES `group_courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enroll_u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_progress` (
  `id` binary(16) NOT NULL,
  `enrollment_id` binary(16) NOT NULL,
  `lesson_id` binary(16) NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `last_position_sec` int NOT NULL DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_lp_enroll` FOREIGN KEY (`enrollment_id`) REFERENCES `course_enrollments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_less` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignment_submissions` (
  `id` binary(16) NOT NULL,
  `group_assignment_id` binary(16) NOT NULL,
  `student_id` binary(16) NOT NULL,
  `submission_type` enum('FILE','TEXT','MIXED') NOT NULL DEFAULT 'FILE',
  `text_content` longtext,
  `file_key` varchar(36) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `is_late` tinyint(1) NOT NULL DEFAULT '0',
  `attempt_number` int NOT NULL DEFAULT '1',
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sub_ga` FOREIGN KEY (`group_assignment_id`) REFERENCES `group_assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_u` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignment_grades` (
  `id` binary(16) NOT NULL,
  `submission_id` binary(16) NOT NULL,
  `grader_id` binary(16) NOT NULL,
  `score` int NOT NULL,
  `feedback` text,
  `status` enum('PENDING','GRADED','RETURNED') NOT NULL DEFAULT 'GRADED',
  `graded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_grades` (`submission_id`),
  CONSTRAINT `fk_grades_sub` FOREIGN KEY (`submission_id`) REFERENCES `assignment_submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_u` FOREIGN KEY (`grader_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_attempts` (
  `id` binary(16) NOT NULL,
  `deployment_id` binary(16) NOT NULL,
  `deployment_type` enum('GROUP_QUIZ','COURSE_QUIZ') NOT NULL,
  `quiz_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `score` int DEFAULT NULL,
  `attempt_number` int NOT NULL DEFAULT '1',
  `is_passed` tinyint(1) DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_att_q` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_responses` (
  `id` binary(16) NOT NULL,
  `attempt_id` binary(16) NOT NULL,
  `question_id` binary(16) NOT NULL,
  `selected_answer_id` binary(16) DEFAULT NULL,
  `text_response` text,
  `is_correct` tinyint(1) DEFAULT NULL,
  `points_earned` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_resp_att` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_resp_q` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- GROUP ACTIVITIES (Meetings & Calendar)
-- --------------------------------------------------------

CREATE TABLE `meetings` (
  `id` binary(16) NOT NULL,
  `group_id` binary(16) NOT NULL,
  `created_by` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `platform` varchar(50) DEFAULT NULL,
  `join_url` text,
  `passcode` varchar(50) DEFAULT NULL,
  `recording_key` varchar(36) DEFAULT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `status` enum('DRAFT','PUBLISHED','CLOSED') NOT NULL DEFAULT 'DRAFT',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_meet_g` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meet_u` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `meeting_attendances` (
  `id` binary(16) NOT NULL,
  `meeting_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` datetime DEFAULT NULL,
  `duration_sec` int NOT NULL DEFAULT '0',
  `is_present` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_att_m` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_mu` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `calendar_events` (
  `id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `start_at` datetime NOT NULL,
  `end_at` datetime DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#3b82f6',
  `source_entity_id` binary(16) DEFAULT NULL,
  `source_entity_type` varchar(50) DEFAULT NULL,
  `is_personal` tinyint(1) NOT NULL DEFAULT '0',
  `group_id` binary(16) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cal_u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- SOCIAL FEATURES (Forum & Feed)
-- --------------------------------------------------------

CREATE TABLE `forum_posts` (
  `id` binary(16) NOT NULL,
  `author_id` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` longtext NOT NULL,
  `status` enum('DRAFT','PUBLISHED','HIDDEN','DELETED') NOT NULL DEFAULT 'PUBLISHED',
  `upvote_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_for_u` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FULLTEXT KEY `ft_posts` (`title`,`content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `forum_comments` (
  `id` binary(16) NOT NULL,
  `post_id` binary(16) NOT NULL,
  `author_id` binary(16) NOT NULL,
  `content` text NOT NULL,
  `upvote_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_for_c_p` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_for_c_u` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `group_feed_posts` (
  `id` binary(16) NOT NULL,
  `group_id` binary(16) NOT NULL,
  `author_id` binary(16) NOT NULL,
  `content` text NOT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `reaction_count` int NOT NULL DEFAULT '0',
  `comment_count` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_feed_g` FOREIGN KEY (`group_id`) REFERENCES `study_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feed_u` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- NOTIFICATIONS
-- --------------------------------------------------------

CREATE TABLE `notifications` (
  `id` binary(16) NOT NULL,
  `recipient_id` binary(16) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text,
  `type` varchar(60) NOT NULL,
  `action_url` text,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notif_u` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notification_settings` (
  `id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `push_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notif_settings` (`user_id`),
  CONSTRAINT `fk_notif_s_u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TRIGGERS
-- --------------------------------------------------------

DELIMITER $$
CREATE TRIGGER `trg_gm_count_insert` AFTER INSERT ON `group_members` FOR EACH ROW BEGIN
    IF NEW.status = 'active' THEN
        UPDATE study_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    END IF;
END$$

CREATE TRIGGER `trg_gm_count_delete` AFTER DELETE ON `group_members` FOR EACH ROW BEGIN
    IF OLD.status = 'active' THEN
        UPDATE study_groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.group_id;
    END IF;
END$$
DELIMITER ;

COMMIT;
