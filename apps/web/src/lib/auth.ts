import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { Google } from 'arctic';

export async function getAuthHeader() {
	if (!browser) {
		return null;
	}

	const sessionId = document.cookie
		.split('; ')
		.find((row) => row.startsWith('sessionId='))
		?.split('=')[1];

	if (!sessionId) {
		try {
			const sessionId = await fetch('/api/session')
				.then((res) => res.json())
				.then((res) => res.sessionId)
				.catch(() => null);

			if (sessionId) {
				document.cookie = `sessionId=${sessionId}; path=/; Secure; HttpOnly`;
				console.log('sessionId', sessionId);
				return `Bearer ${sessionId}`;
			}

			console.log('Session ID not found');
			return null;
		} catch (error) {
			console.error('Error fetching session:', error);
			return null;
		}
	}

	return `Bearer ${sessionId}`;
}
