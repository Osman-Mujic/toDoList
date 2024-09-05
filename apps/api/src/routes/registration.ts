import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { registerSchema } from "../settings/schema";
import { users } from "@todo/db/schema";
import { getDatabaseClient } from "@todo/db/index";

type Bindings = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
};

const registerApp = new Hono<{ Bindings: Bindings }>()
  .post("/register", zValidator("json", registerSchema), async (c) => {
    try {
      const { username, password, confirmPassword } = c.req.valid("json");

      if (password !== confirmPassword) {
        return c.json({ error: "Passwords do not match" }, 400);
      }

      const id = crypto.randomUUID();
      const db = getDatabaseClient(c.env);

      await db.insert(users).values({
        id,
        userName: username,
        hashedPassword: password,
      });

      return c.json(
        {
          username,
          message: "User created successfully",
        },
        201
      );
    } catch (error) {
      console.error("Error processing request:", error);
      return c.json({ error: "Failed to create a user" }, 500);
    }
  })
  .get("/register", async (c) => {
    console.log("register");
    return c.json({ message: "register" });
  });

export default registerApp;
