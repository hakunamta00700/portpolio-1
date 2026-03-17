import { Migration } from '@mikro-orm/migrations';

export class Migration20260317122150 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`blocked_dates\` (\`id\` text not null, \`business_id\` text not null, \`date\` text not null, \`reason\` text null, \`created_at\` text not null, primary key (\`id\`));`);

    this.addSql(`create table \`businesses\` (\`id\` text not null, \`owner_id\` text not null, \`slug\` text not null, \`name\` text not null, \`description\` text null, \`address\` text null, \`phone\` text null, \`logo_url\` text null, \`cover_image_url\` text null, \`category\` text null, \`is_active\` integer not null default true, \`slot_duration\` integer not null default 30, \`max_advance_days\` integer not null default 30, \`min_advance_hours\` integer not null default 1, \`cancel_policy_hours\` integer not null default 24, \`created_at\` text not null, \`updated_at\` text not null, primary key (\`id\`));`);
    this.addSql(`create unique index \`businesses_slug_unique\` on \`businesses\` (\`slug\`);`);

    this.addSql(`create table \`business_schedules\` (\`id\` text not null, \`business_id\` text not null, \`day_of_week\` integer not null, \`is_open\` integer not null default true, \`open_time\` text not null default '09:00', \`close_time\` text not null default '18:00', \`break_start\` text null, \`break_end\` text null, \`created_at\` text not null, \`updated_at\` text not null, primary key (\`id\`));`);

    this.addSql(`create table \`customers\` (\`id\` text not null, \`name\` text not null, \`phone\` text not null, \`email\` text null, \`memo\` text null, \`created_at\` text not null, \`updated_at\` text not null, primary key (\`id\`));`);

    this.addSql(`create table \`notifications\` (\`id\` text not null, \`reservation_id\` text not null, \`type\` text not null, \`recipient\` text not null, \`template\` text not null, \`status\` text not null default 'pending', \`sent_at\` text null, \`error_message\` text null, \`created_at\` text not null, primary key (\`id\`));`);

    this.addSql(`create table \`reservations\` (\`id\` text not null, \`reservation_no\` text not null, \`business_id\` text not null, \`service_id\` text not null, \`customer_id\` text not null, \`date\` text not null, \`start_time\` text not null, \`end_time\` text not null, \`status\` text not null default 'pending', \`customer_memo\` text null, \`owner_memo\` text null, \`cancelled_at\` text null, \`cancel_reason\` text null, \`created_at\` text not null, \`updated_at\` text not null, primary key (\`id\`));`);
    this.addSql(`create unique index \`reservations_reservation_no_unique\` on \`reservations\` (\`reservation_no\`);`);

    this.addSql(`create table \`services\` (\`id\` text not null, \`business_id\` text not null, \`name\` text not null, \`description\` text null, \`duration\` integer not null, \`price\` integer not null default 0, \`is_active\` integer not null default true, \`sort_order\` integer not null default 0, \`created_at\` text not null, \`updated_at\` text not null, primary key (\`id\`));`);

    this.addSql(`create table \`users\` (\`id\` text not null, \`email\` text not null, \`password_hash\` text null, \`name\` text not null, \`phone\` text null, \`role\` text not null default 'owner', \`created_at\` text not null, \`updated_at\` text not null, primary key (\`id\`));`);
    this.addSql(`create unique index \`users_email_unique\` on \`users\` (\`email\`);`);
  }

}
