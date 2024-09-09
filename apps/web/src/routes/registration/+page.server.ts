import type { PageServerLoad, Actions } from './$types.js';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from '@todo/api/src/settings/schema';

export const load: PageServerLoad = async ({ cookies }) => {};
export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(registerSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const { username, password, confirmPassword } = form.data;
		return {
			form,
			username,
			password,
			confirmPassword
		};
	}
};
