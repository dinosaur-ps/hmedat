CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`hash` text NOT NULL,
	`salt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`image` text NOT NULL,
	`category` text DEFAULT 'عام' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
