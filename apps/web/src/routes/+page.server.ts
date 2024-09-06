import { getLucia } from '@todo/utilities/server/lucia';
import { fail, redirect } from '@sveltejs/kit';
import { getTursoClient } from '@todo/db/index';
import type { Actions, PageServerLoad } from './$types';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';
export const load: PageServerLoad = async ({ locals }) => {
	// ...
};

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		const lucia = getLucia(
			getTursoClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			})
		);
		await lucia.invalidateSession(event.locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/login');
	}
};
