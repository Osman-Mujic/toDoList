import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const cookies = event.cookies;
	const sessionId = cookies.get('sessionId');

	if (!sessionId) {
		return new Response(JSON.stringify({ error: 'No active session' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response(JSON.stringify({ sessionId }), {
		headers: { 'Content-Type': 'application/json' }
	});
};
