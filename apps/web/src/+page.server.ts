import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

// Handle function for processing requests
export const handle: Handle = async ({ event, resolve }) => {
	// Example of handling cookies, sessions, or custom headers
	const response = await resolve(event);

	// Modify response if needed
	// response.headers.set('x-custom-header', 'value');

	return response;
};
