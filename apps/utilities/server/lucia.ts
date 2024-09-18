import { Lucia } from "lucia";
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite";
import type { DatabaseUser } from "@todo/db/schema";
import { Google } from "arctic";
import type { Client } from "@libsql/client";

const isDev = process.env.NODE_ENV !== "production";

export function getLucia(db: Client) {
  const adapter = new LibSQLAdapter(db, {
    user: "users",
    session: "sessions",
  });

  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: !isDev,
      },
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.userName,
      };
    },
  });
  return lucia;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof getLucia;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  }
}
