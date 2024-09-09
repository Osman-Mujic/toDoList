import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export async function getAuthHeader() {
	const sessionId = browser ? localStorage.getItem('sessionId') : null;

	if (!sessionId) {
		const baseUrl =
			browser && window.location.hostname === 'localhost'
				? 'http://localhost:5173'
				: 'https://hono-todoapi.osko-mujic49.workers.dev';
		const sessionId = await fetch(`${baseUrl}/settings`)
			.then((res) => res.json())
			.then((res) => res.sessionId)
			.catch(() => null);

		if (sessionId) {
			localStorage.setItem('sessionId', sessionId);
			console.log('sessionId', sessionId);
			return `Bearer ${sessionId}`;
		}
		return null;
	}

	return `Bearer ${sessionId}`;
}
