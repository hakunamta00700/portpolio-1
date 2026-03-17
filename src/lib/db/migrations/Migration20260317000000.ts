import { Migration } from '@mikro-orm/migrations'

export class Migration20260317000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table "blocked_dates" ("id" varchar(255) not null, "business_id" varchar(255) not null, "date" varchar(255) not null, "reason" varchar(255) null, "created_at" varchar(255) not null, constraint "blocked_dates_pkey" primary key ("id"));`)

    this.addSql(`create table "businesses" ("id" varchar(255) not null, "owner_id" varchar(255) not null, "slug" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "address" varchar(255) null, "phone" varchar(255) null, "logo_url" varchar(255) null, "cover_image_url" varchar(255) null, "category" varchar(255) null, "is_active" boolean not null default true, "slot_duration" int not null default 30, "max_advance_days" int not null default 30, "min_advance_hours" int not null default 1, "cancel_policy_hours" int not null default 24, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, constraint "businesses_pkey" primary key ("id"));`)
    this.addSql(`alter table "businesses" add constraint "businesses_slug_unique" unique ("slug");`)

    this.addSql(`create table "business_schedules" ("id" varchar(255) not null, "business_id" varchar(255) not null, "day_of_week" int not null, "is_open" boolean not null default true, "open_time" varchar(255) not null default '09:00', "close_time" varchar(255) not null default '18:00', "break_start" varchar(255) null, "break_end" varchar(255) null, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, constraint "business_schedules_pkey" primary key ("id"));`)

    this.addSql(`create table "customers" ("id" varchar(255) not null, "name" varchar(255) not null, "phone" varchar(255) not null, "email" varchar(255) null, "memo" varchar(255) null, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, constraint "customers_pkey" primary key ("id"));`)

    this.addSql(`create table "notifications" ("id" varchar(255) not null, "reservation_id" varchar(255) not null, "type" varchar(255) not null, "recipient" varchar(255) not null, "template" varchar(255) not null, "status" varchar(255) not null default 'pending', "sent_at" varchar(255) null, "error_message" varchar(255) null, "created_at" varchar(255) not null, constraint "notifications_pkey" primary key ("id"));`)

    this.addSql(`create table "reservations" ("id" varchar(255) not null, "reservation_no" varchar(255) not null, "business_id" varchar(255) not null, "service_id" varchar(255) not null, "customer_id" varchar(255) not null, "date" varchar(255) not null, "start_time" varchar(255) not null, "end_time" varchar(255) not null, "status" varchar(255) not null default 'pending', "customer_memo" varchar(255) null, "owner_memo" varchar(255) null, "cancelled_at" varchar(255) null, "cancel_reason" varchar(255) null, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, constraint "reservations_pkey" primary key ("id"));`)
    this.addSql(`alter table "reservations" add constraint "reservations_reservation_no_unique" unique ("reservation_no");`)

    this.addSql(`create table "services" ("id" varchar(255) not null, "business_id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) null, "duration" int not null, "price" int not null default 0, "is_active" boolean not null default true, "sort_order" int not null default 0, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, constraint "services_pkey" primary key ("id"));`)

    this.addSql(`create table "users" ("id" varchar(255) not null, "email" varchar(255) not null, "password_hash" varchar(255) null, "name" varchar(255) not null, "phone" varchar(255) null, "role" varchar(255) not null default 'owner', "created_at" varchar(255) not null, "updated_at" varchar(255) not null, constraint "users_pkey" primary key ("id"));`)
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blocked_dates";`)
    this.addSql(`drop table if exists "businesses";`)
    this.addSql(`drop table if exists "business_schedules";`)
    this.addSql(`drop table if exists "customers";`)
    this.addSql(`drop table if exists "notifications";`)
    this.addSql(`drop table if exists "reservations";`)
    this.addSql(`drop table if exists "services";`)
    this.addSql(`drop table if exists "users";`)
  }
}
