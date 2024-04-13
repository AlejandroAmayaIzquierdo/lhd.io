CREATE DATABASE IF NOT EXISTS who_wrote_that;

USE who_wrote_that;

CREATE TABLE `users` (
	`id` VARCHAR(60) NOT NULL COLLATE 'latin1_swedish_ci',
	`userName` VARCHAR(60) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`profilePic` VARCHAR(200) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`profileName` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `UC_userName` (`userName`) USING BTREE
)
COLLATE='latin1_swedish_ci';


CREATE TABLE `user_key` (
	`id` VARCHAR(255) NOT NULL COLLATE 'latin1_swedish_ci',
	`user_id` VARCHAR(60) NOT NULL COLLATE 'latin1_swedish_ci',
	`hashed_password` VARCHAR(255) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`google_auth` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`github_id` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`github_auth` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`twitch_auth` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`twitch_id` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `user_id` (`user_id`) USING BTREE
)
COLLATE='latin1_swedish_ci';


CREATE TABLE `user_session` (
	`id` VARCHAR(127) NOT NULL COLLATE 'latin1_swedish_ci',
	`user_id` VARCHAR(15) NOT NULL COLLATE 'latin1_swedish_ci',
	`active_expires` BIGINT(20) UNSIGNED NOT NULL,
	`idle_expires` BIGINT(20) UNSIGNED NOT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `user_id` (`user_id`) USING BTREE
)
COLLATE='latin1_swedish_ci';

CREATE TABLE `rooms` (
	`id` VARCHAR(200) NOT NULL COLLATE 'latin1_swedish_ci',
	`users` VARCHAR(200) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`maxUsers` INT(11) NOT NULL DEFAULT '2',
	`isActive` INT(1) NOT NULL DEFAULT '0',
	`isEnded` INT(1) NOT NULL DEFAULT '0',
	`isPrivate` INT(1) NULL DEFAULT '0',
	`createdAt` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`startedAt` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`endedAt` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`gameData` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`winnerUser` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci';


CREATE TABLE `cron_tasks` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
    `schedule` VARCHAR(50) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
    `is_active` TINYINT(1) UNSIGNED NOT NULL DEFAULT '0',
    `lastEnd` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
    PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci';

CREATE TABLE `chats` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `pack` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
    `difficulty` INT(11) NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci';

CREATE TABLE `messages` (
    `messageID` INT(11) NOT NULL AUTO_INCREMENT,
    `chatID` INT(11) NOT NULL,
    `message` VARCHAR(300) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
    `isMine` TINYINT(4) NOT NULL DEFAULT '0',
    PRIMARY KEY (`messageID`) USING BTREE,
    INDEX `chat` (`chatID`) USING BTREE
)
COLLATE='latin1_swedish_ci';

CREATE TABLE `storage` (
	`storageId` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(200) NOT NULL COLLATE 'latin1_swedish_ci',
	`type` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`path` MEDIUMTEXT NOT NULL COLLATE 'latin1_swedish_ci',
	`hash` VARCHAR(300) NOT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`storageId`) USING BTREE
)
COLLATE='latin1_swedish_ci';


INSERT INTO `cron_tasks` (`id`, `name`, `schedule`, `is_active`, `lastEnd`) VALUES (1, 'SessionCron', '0 0 * * *', 1, '2024-03-02 17:00:00');

INSERT INTO `rooms` (`id`, `maxUsers`, `isActive`, `isEnded`, `isPrivate`) VALUES ('main',10,0,0,0);