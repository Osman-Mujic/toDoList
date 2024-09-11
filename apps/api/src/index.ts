import { Hono } from "hono";
import { cors } from "hono/cors";
import tasksapp from "./routes/tasks";

type Bindings = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>()
  .use(
    cors({
      origin: "*",
    })
  )

  .route("/", tasksapp)
  .get("/", (c) => c.text("API is running"));

export type AppType = typeof app;
export default app;
