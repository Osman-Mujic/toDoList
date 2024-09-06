import { getLucia } from '@todo/utilities/server/lucia';
import { fail } from '@sveltejs/kit';
import { getTursoClient } from '@todo/db/index';
import { verify } from '@node-rs/argon2';
import type { Actions, PageServerLoad } from './$types.js';
import { users } from '@todo/db/schema';
import { getDatabaseClient } from '@todo/db/index';
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from '$env/static/private';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event: any) => {
	try {
		if (event.locals.user) {
			console.log('User is already logged in');
		}
		return {};
	} catch (error) {
		console.error('Error during load:', error);
		return fail(500, { message: 'Server error during load' });
	}
};
export const actions: Actions = {
	default: async (event: any) => {
		const lucia = getLucia(
			getTursoClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			})
		);
		try {
			console.log('Starting login process...');
			const formData = await event.request.formData();
			const username = formData.get('username');
			const password = formData.get('password');

			console.log('Received form data:', { username, password });

			if (typeof username !== 'string' || typeof password !== 'string') {
				console.log('Invalid input');
				return fail(400, { message: 'Invalid input' });
			}

			const db = getDatabaseClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			});

			console.log('Database client initialized');

			const existingUser = await db.query.users.findFirst({
				where: eq(users.userName, username)
			});

			console.log('Existing user:', existingUser);

			if (!existingUser || existingUser.hashedPassword !== password) {
				console.log('Invalid credentials');
				return fail(400, { message: 'Incorrect username or password' });
			}
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			console.log('Login successful');
			return { success: true };
		} catch (error) {
			console.error('Error during login process:', error);
			return fail(500, { message: 'Server error during login' });
		}
	}
};
