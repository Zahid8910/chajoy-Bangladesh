CREATE DATABASE IF NOT EXISTS `ChaJoy`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ChaJoy`;

CREATE TABLE `users` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` ENUM('admin', 'employee', 'customer') NOT NULL,
  `username` VARCHAR(80) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NULL,
  `contact` VARCHAR(40) NULL,
  `gender` ENUM('Male', 'Female', 'Other', 'Prefer not to say') NULL,
  `security_question` VARCHAR(255) NULL,
  `security_answer_hash` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB;

CREATE TABLE `branches` (
  `branch_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `status` ENUM('active', 'upcoming', 'unavailable') NOT NULL DEFAULT 'active',
  `map_url` TEXT NULL,
  PRIMARY KEY (`branch_id`),
  UNIQUE KEY `uq_branches_name` (`name`)
) ENGINE=InnoDB;

INSERT IGNORE INTO `branches` (`name`, `status`, `map_url`) VALUES
  ('Laxmibazar Branch', 'active', 'https://www.google.com/maps/place/Chajoy+Laxmibazar/@23.7083441,90.4060124,16z'),
  ('Uttara Branch', 'active', 'https://www.google.com/maps/place/CHAJOY+UTTARA+(BNS)/@23.8712301,90.2768466,12z'),
  ('Rampura Branch', 'active', 'https://www.google.com/maps/place/ChaJoy+Rampura+Bazar/@23.7601859,90.4094083,16z'),
  ('Mohammadpur Branch', 'active', 'https://www.google.com/maps/place/CHAJOY+%7C+Mohammadpur/@23.7648558,90.3558406,17z'),
  ('Banasree Branch', 'active', 'https://www.google.com/maps/place/ChaJoy+-+Banasree/@23.7610628,90.3982769,14z'),
  ('Badda Branch', 'active', 'https://www.google.com/maps/place/CHAJOY+Badda/@23.7862882,90.3984949,14z'),
  ('Shonir Akhra Branch', 'upcoming', ''),
  ('Aftabnagar Branch', 'upcoming', ''),
  ('Mirpur 2 Branch', 'active', 'https://www.google.com/maps/place/CHAJOY+Mirpur+2/@23.8050607,90.2868488,13z'),
  ('Mirpur 10 Branch', 'active', 'https://www.google.com/maps/place/CHAJOY+-+Mirpur+10/@23.8066217,90.3338703,14z'),
  ('Bashundhara Branch', 'active', 'https://www.google.com/maps/place/ChaJoy+Bashundhara/@23.7862882,90.3984949,14z'),
  ('Kochukhet Branch', 'active', 'https://www.google.com/maps/place/Chajoy+-+Kochukhet/@23.8712301,90.2768466,12z');

CREATE TABLE `employee_branches` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `branch_id`),
  CONSTRAINT `fk_employee_branches_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_employee_branches_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `menu_items` (
  `menu_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('sundae', 'tea', 'milk-tea', 'shake', 'ice-cream') NOT NULL,
  `description` VARCHAR(255) NULL,
  `price_bdt` DECIMAL(10,2) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `image_url` VARCHAR(500) NULL,
  PRIMARY KEY (`menu_item_id`),
  UNIQUE KEY `uq_menu_items_name` (`name`),
  CONSTRAINT `chk_menu_items_price` CHECK (`price_bdt` >= 0)
) ENGINE=InnoDB;

INSERT IGNORE INTO `menu_items` (`name`, `category`, `description`, `price_bdt`, `active`, `image_url`) VALUES
  ('Strawberry Sundae', 'sundae', 'Sweet strawberry cream dessert.', 200.00, 1, NULL),
  ('Blueberry Sundae', 'sundae', 'Blueberry with a creamy finish.', 200.00, 1, NULL),
  ('Mango Sundae', 'sundae', 'Bright mango flavor with cream.', 200.00, 1, NULL),
  ('Peach Sundae', 'sundae', 'Soft peach flavor and creamy texture.', 200.00, 1, NULL),
  ('Fresh Lemon Tea', 'tea', 'Refreshing lemon tea.', 100.00, 1, NULL),
  ('Jasmine Green Tea', 'tea', 'Light, fragrant green tea.', 100.00, 1, NULL),
  ('Strawberry Tea', 'tea', 'Fruit tea with strawberry notes.', 120.00, 1, NULL),
  ('Guava Green Tea', 'tea', 'Guava blended with green tea.', 100.00, 1, NULL),
  ('Brown Sugar Boba Milk', 'milk-tea', 'Rich milk tea with brown sugar boba.', 180.00, 1, NULL),
  ('Classic Milk Tea', 'milk-tea', 'Comforting black tea with milk.', 170.00, 1, NULL),
  ('Strawberry Boba Milk', 'milk-tea', 'Strawberry milk tea with boba.', 180.00, 1, NULL),
  ('Blueberry Milk Tea', 'milk-tea', 'Blueberry milk tea, served chilled.', 160.00, 1, NULL),
  ('Chocolate Oreo Sundae', 'sundae', 'Chocolate dessert with Oreo.', 250.00, 1, NULL),
  ('Peach Shake', 'shake', 'Cold, smooth peach shake.', 100.00, 1, NULL),
  ('Blueberry Shake', 'shake', 'Thick blueberry shake.', 150.00, 1, NULL),
  ('Vanilla Ice Cream', 'ice-cream', 'Classic smooth vanilla ice cream.', 80.00, 1, NULL),
  ('Matcha Ice Cream', 'ice-cream', 'Distinctive green tea ice cream.', 80.00, 1, NULL);

CREATE TABLE `branch_menu_availability` (
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `menu_item_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
  PRIMARY KEY (`branch_id`, `menu_item_id`),
  CONSTRAINT `fk_availability_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_availability_menu_item`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `orders` (
  `order_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `receipt_number` VARCHAR(30) NOT NULL,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('received', 'preparing', 'ready', 'rejected', 'picked_up') NOT NULL DEFAULT 'received',
  `total_bdt` DECIMAL(10,2) NOT NULL,
  `rejection_reason` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_orders_receipt_number` (`receipt_number`),
  KEY `idx_orders_customer_status` (`customer_id`, `status`),
  KEY `idx_orders_branch_status` (`branch_id`, `status`),
  CONSTRAINT `fk_orders_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_orders_total` CHECK (`total_bdt` >= 0)
) ENGINE=InnoDB;

CREATE TABLE `order_items` (
  `order_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `menu_item_id` BIGINT UNSIGNED NOT NULL,
  `item_name_snapshot` VARCHAR(150) NOT NULL,
  `unit_price_bdt` DECIMAL(10,2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `idx_order_items_order` (`order_id`),
  CONSTRAINT `fk_order_items_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_order_items_menu_item`
    FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_order_items_quantity` CHECK (`quantity` > 0),
  CONSTRAINT `chk_order_items_price` CHECK (`unit_price_bdt` >= 0)
) ENGINE=InnoDB;

CREATE TABLE `reviews` (
  `review_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NULL,
  `order_id` BIGINT UNSIGNED NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `review_text` TEXT NULL,
  `status` ENUM('pending', 'published', 'hidden') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `idx_reviews_status` (`status`),
  CONSTRAINT `fk_reviews_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_branch`
    FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB;
