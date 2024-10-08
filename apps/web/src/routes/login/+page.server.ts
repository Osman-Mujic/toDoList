import { getLucia } from '@todo/utilities/server/lucia';
import { fail } from '@sveltejs/kit';
import { getTursoClient } from '@todo/db/index';
import type { Actions, PageServerLoad } from './$types.js';
import { users } from '@todo/db/schema';
import { getDatabaseClient } from '@todo/db/index';
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from '$env/static/private';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@todo/utilities/server/password';

export const actions: Actions = {
	default: async (event: any) => {
		const lucia = getLucia(
			getTursoClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			})
		);
		try {
			const formData = await event.request.formData();
			const username = formData.get('username');
			const password = formData.get('password');

			if (typeof username !== 'string' || typeof password !== 'string') {
				return fail(400, { message: 'Invalid input' });
			}

			const db = getDatabaseClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			});

			const existingUser = await db.query.users.findFirst({
				where: eq(users.userName, username)
			});

			if (!existingUser) {
				return fail(400, { message: 'Incorrect username or password' });
			}

			// Verify password using hashed password
			const isPasswordValid = await verifyPassword(existingUser.hashedPassword, password);

			if (!isPasswordValid) {
				return fail(400, { message: 'Incorrect username or password' });
			}

			// Create session and set cookies
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			event.cookies.set('sessionId', session.id, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 // 1 day
			});
			return { success: true };
		} catch (error) {
			return fail(500, { message: 'Server error during login' });
		}
	}
};
