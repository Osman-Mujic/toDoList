import type { LayoutServerLoad } from './$types';
import { getLucia } from '@todo/utilities/server/lucia';
import { redirect } from '@sveltejs/kit';
import { getDatabaseClient } from '@todo/db/index';
import { eq } from 'drizzle-orm';
import { users, sessions } from '@todo/db/schema';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const sessionId = cookies.get('sessionId');
	console.log('Session ID:', sessionId);

	const isLoggedIn = Boolean(sessionId);
	let userName = null;

	if (isLoggedIn && sessionId) {
		const db = getDatabaseClient({
			TURSO_DATABASE_URL,
			TURSO_AUTH_TOKEN
		});

		const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();

		if (session) {
			const user = await db
				.select({
					userName: users.userName
				})
				.from(users)
				.where(eq(users.id, session.userId))
				.get();

			if (user) {
				userName = user.userName;
			}
		}
	}

	if (locals.user) {
		throw redirect(307, '/settings');
	}

	return { isLoggedIn, userName };
};
