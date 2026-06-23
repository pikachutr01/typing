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
