// src/routes/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import { getLucia } from '@todo/utilities/server/lucia';
import { getTursoClient } from '@todo/db/index';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const POST = async ({ cookies }) => {
	const lucia = getLucia(
		getTursoClient({
			TURSO_DATABASE_URL,
			TURSO_AUTH_TOKEN
		})
	);

	const sessionId = cookies.get('sessionId');

	if (sessionId) {
		await lucia.invalidateSession(sessionId);

		cookies.delete('sessionId', {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production'
		});
	}

	throw redirect(303, '/login');
};
