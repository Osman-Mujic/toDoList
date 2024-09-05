import { Lucia } from 'lucia';
import { LibSQLAdapter } from '@lucia-auth/adapter-sqlite';
import { createClient } from '@libsql/client';
import type { DatabaseUser } from '@todo/db/schema';

const isDev = process.env.NODE_ENV !== 'production';

const db = createClient({
	url: 'libsql://todolist-db-osmanmujic.turso.io',
	authToken:
		'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjQ2NzE0NDYsInAiOnsicnciOnsibnMiOlsiOTA4MzYxNzctM2FmMy00ZjRkLTgzMzUtNzU5NWExNjMwZTVhIl19fX0.xM-mgS0pVN4fU0avnkJDJNfnZEEZ4PW2vMF03fEcqs6LEBWv-iCJBz1U3G0dI93QQzzCvZ-2-OSOMeZLuiVJCg'
});

const adapter = new LibSQLAdapter(db, {
	user: 'users',
	session: 'sessions'
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !isDev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.userName
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, 'id'>;
	}
}
