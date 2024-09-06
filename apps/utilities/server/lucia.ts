import { Lucia } from "lucia";
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite";
import { createClient } from "@libsql/client";
import type { DatabaseUser } from "@todo/db/schema";
import { TURSO_AUTH_TOKEN } from "$env/static/private";
import type { get } from "svelte/store";
import type { getTursoClient } from "@todo/db/index";
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
