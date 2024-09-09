import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { getLucia } from "@todo/utilities/server/lucia";
import { getTursoClient } from "@todo/db/index";

const authorize: MiddlewareHandler = async (c, next) => {
  if (c.req.path === "/register") {
    await next();
    return;
  }
  const authorizationHeader = c.req.raw.headers.get("Authorization");

  if (!authorizationHeader) {
    throw new HTTPException(401, {
      message: "Missing authorization header",
    });
  }
  const lucia = getLucia(
    getTursoClient({
      TURSO_DATABASE_URL: c.env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: c.env.TURSO_AUTH_TOKEN,
    })
  );
  const sessionId = lucia.readBearerToken(authorizationHeader);

  if (!sessionId) {
    throw new HTTPException(401, {
      message: "Unable to read session id from token",
    });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    throw new HTTPException(401, {
      message: "Unable to validate session",
    });
  }

  c.set("user", {
    id: user.id,
    userName: user.username,
  });

  await next();
};

export default authorize;
