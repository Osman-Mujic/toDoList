import dotenv from "dotenv";
import { Hono } from "hono";
import { serve, type HttpBindings } from "@hono/node-server";
import { cors } from "hono/cors";
import { createClient } from "@libsql/client";
import { z } from "zod";
import { formSchema } from "./settings/schema";
import { drizzle } from "drizzle-orm/libsql";
import { tasks } from "@todo/db/schema";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

dotenv.config();

type Bindings = HttpBindings & {
  /* ... */
};
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

const app = new Hono<{ Bindings: Bindings }>()
  .use(
    cors({
      origin: "*",
    })
  )

  .post("/tasks", zValidator("json", formSchema), async (c) => {
    try {
      const { taskName, startTime, endTime } = c.req.valid("json");
      const id = crypto.randomUUID();

      await db.insert(tasks).values({
        id,
        task_name: taskName,
        start_time: startTime,
        end_time: endTime,
      });

      return c.json({
        id,
        taskName,
        startTime,
        endTime,
        message: "Task created successfully",
      });
    } catch (error) {
      console.error("Error processing request:", error);
      return c.json({ error: "Failed to create task" }, 500);
    }
  })

  .get("/tasks", async (c) => {
    try {
      const result = await db.select().from(tasks);

      const formattedData = result.map((row) => ({
        id: row.id,
        taskName: row.task_name,
        startTime: row.start_time,
        endTime: row.end_time,
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
      const { id } = c.req.valid("param");
      try {
        const { taskName, startTime, endTime } = c.req.valid("json");

        await db
          .update(tasks)
          .set({
            task_name: taskName,
            start_time: startTime,
            end_time: endTime,
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
      //const id = c.req.param("id") as string;
      const { id } = c.req.valid("param");
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

export type AppType = typeof app;
serve(app);
export default app;
