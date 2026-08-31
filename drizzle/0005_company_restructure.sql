PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`intro` text,
	`website` text,
	`career_url` text,
	`models` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
INSERT INTO `__new_companies`("id", "name", "intro", "website", "created_at") SELECT "id", "name", "intro", "website", "created_at" FROM `companies`;--> statement-breakpoint
DROP TABLE `companies`;--> statement-breakpoint
ALTER TABLE `__new_companies` RENAME TO `companies`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
