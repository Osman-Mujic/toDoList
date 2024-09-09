import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.session) {
		return new Response(JSON.stringify({ error: 'No active session' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (event.locals.session.id) {
		return new Response(JSON.stringify({ sessionId: event.locals.session.id }), {
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return new Response(JSON.stringify({ error: 'No active session' }), {
		status: 401,
		headers: { 'Content-Type': 'application/json' }
	});
};
