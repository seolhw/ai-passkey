PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`title` text NOT NULL,
	`jd` text NOT NULL,
	`salary_min` integer,
	`salary_max` integer,
	`job_type` text,
	`experience` text,
	`education` text,
	`work_mode` text,
	`status` text DEFAULT 'open' NOT NULL,
	`source_url` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_jobs`("id", "company_id", "title", "jd", "source_url", "source", "created_at") SELECT "id", "company_id", "title", "jd", "source_url", "source", "created_at" FROM `jobs`;
--> statement-breakpoint
DROP TABLE `jobs`;
--> statement-breakpoint
ALTER TABLE `__new_jobs` RENAME TO `jobs`;
--> statement-breakpoint
CREATE INDEX `jobs_company_id_idx` ON `jobs` (`company_id`);
--> statement-breakpoint
CREATE TABLE `job_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` integer NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `job_tags_job_id_idx` ON `job_tags` (`job_id`);
--> statement-breakpoint
CREATE INDEX `job_tags_tag_idx` ON `job_tags` (`tag`);
--> statement-breakpoint
CREATE TABLE `job_cities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` integer NOT NULL,
	`city` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `job_cities_job_id_idx` ON `job_cities` (`job_id`);
--> statement-breakpoint
CREATE INDEX `job_cities_city_idx` ON `job_cities` (`city`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;
