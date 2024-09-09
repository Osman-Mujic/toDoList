import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { i18n } from '$lib/i18n';
import { getLucia } from '@todo/utilities/server/lucia';
import { getTursoClient } from '@todo/db/index';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export const authHandle: Handle = async ({ event, resolve }) => {
	const lucia = getLucia(
		getTursoClient({
			TURSO_DATABASE_URL,
			TURSO_AUTH_TOKEN
		})
	);
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	try {
		const { session, user } = await lucia.validateSession(sessionId);

		if (session) {
			if (session.fresh) {
				const sessionCookie = lucia.createSessionCookie(session.id);
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '/',
					...sessionCookie.attributes
				});
			}

			event.locals.user = user;
			event.locals.session = session;
		} else {
			event.cookies.delete(lucia.sessionCookieName, { path: '/' });
			event.locals.user = null;
			event.locals.session = null;
		}
	} catch (error) {
		console.error('Session validation error:', error);
		event.locals.user = null;
		event.locals.session = null;
		event.cookies.delete(lucia.sessionCookieName, { path: '/' });
	}

	return resolve(event);
};

export const handle: Handle = sequence(i18n.handle(), authHandle);
