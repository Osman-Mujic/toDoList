import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { lucia } from "../../../web/src/lib/lucia";
import type { User } from "../../../utilities/types";
const authorize: MiddlewareHandler = async (c, next) => {
  const authorizationHeader = c.req.raw.headers.get("Authorization");

  if (!authorizationHeader) {
    throw new HTTPException(401, {
      message: "Missing authorization header",
    });
  }

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
