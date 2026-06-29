CREATE TABLE `case_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`sender` text NOT NULL,
	`role` text NOT NULL,
	`text` text NOT NULL,
	`time` text NOT NULL,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`channel` text NOT NULL,
	`sender` text NOT NULL,
	`role` text NOT NULL,
	`text` text NOT NULL,
	`time` text NOT NULL,
	`timestamp` text NOT NULL,
	`attachment_name` text,
	`attachment_size` text,
	`attachment_url` text,
	`read_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`patient_initials` text NOT NULL,
	`dentist_name` text NOT NULL,
	`clinic_name` text NOT NULL,
	`carrier` text NOT NULL,
	`tracking_number` text NOT NULL,
	`status` text NOT NULL,
	`shipped_date` text,
	`delivered_date` text,
	`estimated_delivery_date` text,
	`notes` text,
	`recipient_signee` text
);
--> statement-breakpoint
CREATE TABLE `delivery_milestones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`delivery_id` text NOT NULL,
	`status` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`timestamp` text NOT NULL,
	`location` text
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`description` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`amount` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text,
	`dentist_name` text NOT NULL,
	`clinic_name` text NOT NULL,
	`issued_date` text NOT NULL,
	`due_date` text NOT NULL,
	`subtotal` real NOT NULL,
	`gst_rate` real NOT NULL,
	`gst_amount` real NOT NULL,
	`total_amount` real NOT NULL,
	`total_paid` real NOT NULL,
	`outstanding_balance` real NOT NULL,
	`status` text NOT NULL,
	`pdf_template_id` text
);
--> statement-breakpoint
CREATE TABLE `notifications_history` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`level` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`time` text NOT NULL,
	`unread` integer NOT NULL,
	`type` text NOT NULL,
	`recipient_role` text,
	`smtp_payload` text
);
--> statement-breakpoint
CREATE TABLE `payment_records` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`transaction_id` text,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);