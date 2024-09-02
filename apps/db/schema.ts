import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  task_name: text("task_name").notNull(),
  start_time: text("start_time").notNull(),
  end_time: text("end_time").notNull(),
  created_at: text("created_at").default("CURRENT_TIMESTAMP"),
});
