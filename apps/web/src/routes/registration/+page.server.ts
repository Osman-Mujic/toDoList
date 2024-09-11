import { getLucia } from '@todo/utilities/server/lucia';
import { fail } from '@sveltejs/kit';
import { getTursoClient } from '@todo/db/index';
import { users } from '@todo/db/schema';
import { getDatabaseClient } from '@todo/db/index';
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from '$env/static/private';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@todo/utilities/server/password';
import type { Actions, PageServerLoad } from './$types.js';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { registerSchema } from '@todo/api/src/settings/schema';
import { redirect } from '@sveltejs/kit';
import { goto } from '$app/navigation';
export const actions: Actions = {
	default: async (event: any) => {
		const lucia = getLucia(
			getTursoClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			})
		);
		let success: boolean;
		const formData = await event.request.formData();
		const form = await superValidate(formData, zod(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const username = formData.get('username');
			const password = formData.get('password');
			const confirmPassword = formData.get('confirmPassword');

			if (
				typeof username !== 'string' ||
				typeof password !== 'string' ||
				typeof confirmPassword !== 'string'
			) {
				return fail(400, { form });
			}

			if (password !== confirmPassword) {
				form.errors.confirmPassword = ['Passwords do not match'];
				return fail(400, { form });
			}

			const db = getDatabaseClient({
				TURSO_DATABASE_URL,
				TURSO_AUTH_TOKEN
			});

			const existingUser = await db.query.users.findFirst({
				where: eq(users.userName, username)
			});

			if (existingUser) {
				form.errors.username = ['Username already taken'];
				return fail(400, { form });
			}

			const hashedPassword = await hashPassword(password);

			const result = await db.insert(users).values({
				id: crypto.randomUUID(),
				userName: username,
				hashedPassword: hashedPassword
			});
			success = result.rowsAffected > 0;
		} catch (error) {
			return fail(500, { form, message: 'Server error during registration' });
		}
		if (success) {
			return redirect(302, '/login');
		} else {
			return fail(400, { form, message: 'Unkown error' });
		}
	}
};
