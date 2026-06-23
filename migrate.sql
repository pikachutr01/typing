CREATE TABLE `text_categories` (
  `text_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `display_title` varchar(255) NOT NULL,
  PRIMARY KEY (`text_id`, `category_id`),
  CONSTRAINT `tc_text_fk` FOREIGN KEY (`text_id`) REFERENCES `texts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tc_cat_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `text_categories` (`text_id`, `category_id`, `display_title`)
SELECT `id`, `category_id`, `title` FROM `texts` WHERE `category_id` IS NOT NULL;

ALTER TABLE `texts` DROP FOREIGN KEY `texts_ibfk_1`;
ALTER TABLE `texts` DROP COLUMN `category_id`;

ALTER TABLE `test_history` ADD COLUMN `is_failed_by_skipped_words` tinyint(1) NOT NULL DEFAULT 0 AFTER `skipped_words`;
ALTER TABLE `test_history` ADD COLUMN `extra_space_errors` int(11) NOT NULL DEFAULT 0 AFTER `is_failed_by_skipped_words`;
ALTER TABLE `test_history` ADD COLUMN `has_incomplete_last_word` tinyint(1) NOT NULL DEFAULT 0 AFTER `extra_space_errors`;

-- Update #2: Add mistyped_words_json tracking
ALTER TABLE `test_history` ADD COLUMN `mistyped_words_json` text DEFAULT NULL AFTER `input_value`;
