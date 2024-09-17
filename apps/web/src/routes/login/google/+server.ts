import type { RequestEvent } from '../$types';
import { generateCodeVerifier, generateState } from 'arctic';
import { google } from '@todo/utilities/server/lucia';
import { redirect } from '@sveltejs/kit';
export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();

	const url = await google.createAuthorizationURL(state, codeVerifier, {
		scopes: ['profile', 'email']
	});

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 10
	});

	event.cookies.set('google_oauth_code_verifier', codeVerifier, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 10
	});

	return redirect(302, url.toString());
}
