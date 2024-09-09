// +page.server.ts
import { getLucia } from '@todo/utilities/server/lucia';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getTursoClient } from '@todo/db/index';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(307, '/settings');
	}
	return {};
};

export const actions: Actions = {
	logout: async ({ cookies, locals }) => {
		try {
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
		} catch (error) {
			console.error('Logout failed:', error);
			return fail(500, { message: 'Logout failed' });
		}
	}
};
