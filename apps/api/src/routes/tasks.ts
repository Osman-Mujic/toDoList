import { Hono } from "hono";
import { z } from "zod";
import { formSchema } from "../settings/schema";
import { tasks, users, sessions } from "@todo/db/schema";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { getDatabaseClient } from "@todo/db/index";
import authorize from "../middleware/middleware";
import type { User } from "../../../utilities/types";
type Bindings = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
};

const tasksapp = new Hono<{ Bindings: Bindings; user: User }>()
  .use("*", authorize)
  .post("/tasks", zValidator("json", formSchema), async (c: any) => {
    try {
      const { taskName, startTime, endTime } = c.req.valid("json");
      const id = crypto.randomUUID();
      const db = getDatabaseClient(c.env);
      const userId = c.get("user").id;
      console.log("CURRENT USER ID:", userId);
      await db.insert(tasks).values({
        id,
        taskName,
        startTime,
        endTime,
        userId,
      });

      return c.json({
        id,
        taskName,
        startTime,
        endTime,
        userId,
        message: "Task created successfully",
      });
    } catch (error) {
      console.error("Error processing request:", error);
      return c.json({ error: "Failed to create task" }, 500);
    }
  })

  .get("/tasks", async (c: any) => {
    const db = getDatabaseClient(c.env);
    const userId = c.get("user").id;
    console.log("CURRENT USER ID:", userId);
    try {
      const result = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId));

      const formattedData = result.map((row) => ({
        id: row.id,
        taskName: row.taskName,
        startTime: row.startTime,
        endTime: row.endTime,
      }));

      return c.json(formattedData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return c.json({ error: "Failed to fetch tasks" }, 500);
    }
  })

  .put(
    "/tasks/:id",
    zValidator("param", z.object({ id: z.string().uuid() })),
    zValidator("json", formSchema),
    async (c) => {
      const db = getDatabaseClient(c.env);
      const { id } = c.req.valid("param");
      try {
        const { taskName, startTime, endTime } = c.req.valid("json");

        await db
          .update(tasks)
          .set({
            taskName: taskName,
            startTime: startTime,
            endTime: endTime,
          })
          .where(eq(tasks.id, id));

        return c.json({
          id,
          taskName,
          startTime,
          endTime,
          message: "Task updated successfully",
        });
      } catch (error) {
        console.error("Error processing update request:", error);
        return c.json({ error: "Failed to update task" }, 500);
      }
    }
  )

  .delete(
    "/tasks/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().uuid(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const db = getDatabaseClient(c.env);
      try {
        await db.delete(tasks).where(eq(tasks.id, id));

        return c.json({
          id,
          message: "Task deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting task:", error);
        return c.json({ error: "Failed to delete task" }, 500);
      }
    }
  );

export default tasksapp;
