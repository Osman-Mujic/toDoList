import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema, editFormSchema } from '@todo/api/src/settings/schema';
import { getLucia } from '@todo/utilities/server/lucia';
import { getTursoClient } from '@todo/db/index';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';
export const load: PageServerLoad = async ({ cookies }) => {
	const sessionId = cookies.get('sessionId');

	if (!sessionId) {
		return redirect(302, '/login');
	}

	const form = await superValidate(zod(formSchema));
	const editForm = await superValidate(zod(editFormSchema));

	return {
		form,
		editForm
	};
};
export const actions: Actions = {
	submit: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const { taskName, startTime, endTime } = form.data;
		return {
			form,
			taskName,
			startTime,
			endTime
		};
	},

	logout: async (event) => {
		const lucia = getLucia(
			getTursoClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			})
		);
		try {
			const session = event.locals.session;

			if (!session) {
				console.log('No active session');
				return fail(401, { message: 'Unauthorized' });
			}

			await lucia.invalidateSession(session.id);

			event.cookies.delete('sessionId', { path: '/' });

			console.log('Logout successful');
		} catch (error) {
			console.error('Error during logout:', error);
			return fail(500, { message: 'Server error during logout' });
		}
		return redirect(302, '/login');
	}
};
