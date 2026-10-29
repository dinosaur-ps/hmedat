ALTER TABLE `products` ADD `original_price` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `badge` text DEFAULT 'מבצע' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `featured` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deal_end` integer;