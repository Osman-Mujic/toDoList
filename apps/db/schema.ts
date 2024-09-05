import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  userName: text("user_name").notNull(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  taskName: text("task_name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  refreshToken: text("refresh_token"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export interface DatabaseUser {
  id: string;
  userName: string;
  hashedPassword: string;
}
