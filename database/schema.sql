CREATE DATABASE IF NOT EXISTS `internsphere_db`;
USE `internsphere_db`;

-- Drop tables in reverse order of dependencies to avoid foreign key errors
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `internships`;
DROP TABLE IF EXISTS `users`;

-- Users Table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('candidate', 'employer') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Internships Table
CREATE TABLE `internships` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `requirements` TEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `stipend` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `type` ENUM('remote', 'onsite', 'hybrid') NOT NULL,
  `employer_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications Table
CREATE TABLE `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `internship_id` INT NOT NULL,
  `candidate_id` INT NOT NULL,
  `resume_url` VARCHAR(512) NOT NULL,
  `cover_letter` TEXT NOT NULL,
  `status` ENUM('Pending', 'Reviewing', 'Interviewing', 'Accepted', 'Rejected') DEFAULT 'Pending',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`internship_id`) REFERENCES `internships` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`candidate_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
