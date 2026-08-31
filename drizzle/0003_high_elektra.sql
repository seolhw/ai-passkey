PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_jd_sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`adapter_name` text,
	`url` text NOT NULL,
	`last_fetched_at` integer,
	`status` text DEFAULT 'idle' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_jd_sources`("id", "name", "adapter_name", "url", "last_fetched_at", "status") SELECT "id", "name", "adapter_name", "url", "last_fetched_at", "status" FROM `jd_sources`;--> statement-breakpoint
DROP TABLE `jd_sources`;--> statement-breakpoint
ALTER TABLE `__new_jd_sources` RENAME TO `jd_sources`;--> statement-breakpoint
PRAGMA foreign_keys=ON;