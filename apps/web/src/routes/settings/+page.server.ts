import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema, editFormSchema } from '@todo/api/src/settings/schema';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(formSchema));
	const editForm = await superValidate(zod(editFormSchema));
	return { form, editForm };
};

export const actions: Actions = {
	default: async (event) => {
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
	}
};
