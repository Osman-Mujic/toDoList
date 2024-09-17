import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

type Config = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
};
export function getDatabaseClient(config: Config) {
  const url = config.TURSO_DATABASE_URL;
  const authToken = config.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

export function getTursoClient(config: Config) {
  const url = config.TURSO_DATABASE_URL;
  const authToken = config.TURSO_AUTH_TOKEN;

  const client = createClient({
    url,
    authToken,
  });

  return client;
}
