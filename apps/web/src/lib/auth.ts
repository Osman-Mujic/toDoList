import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export async function getAuthHeader() {
	const sessionId = browser ? localStorage.getItem('sessionId') : null;

	if (!sessionId) {
		const sessionId = await fetch('http://localhost:5173/api/session')
			.then((res) => res.json())
			.then((res) => res.sessionId)
			.catch(() => null);

		if (sessionId) {
			localStorage.setItem('sessionId', sessionId);
			console.log('sessionId', sessionId);
			return `Bearer ${sessionId}`;
		}

		if (!sessionId) {
			console.log('Session ID not found');
		}

		return null;
	}

	return `Bearer ${sessionId}`;
}
