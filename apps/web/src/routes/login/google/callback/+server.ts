import { OAuth2RequestError } from 'arctic';
import { google, getLucia } from '@todo/utilities/server/lucia';
import type { RequestEvent } from '@sveltejs/kit';
import { getTursoClient } from '@todo/db/index';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';
import { getDatabaseClient } from '@todo/db/index';
import { users } from '@todo/db/schema';
import { eq } from 'drizzle-orm';

interface GoogleUser {
	sub: string; // Unique identifier for the user
	name: string; // Full name of the user
	email: string; // Email address of the user
}

export async function GET(event: RequestEvent): Promise<Response> {
	const lucia = getLucia(
		getTursoClient({
			TURSO_DATABASE_URL,
			TURSO_AUTH_TOKEN
		})
	);
	const db = getDatabaseClient({
		TURSO_DATABASE_URL,
		TURSO_AUTH_TOKEN
	});

	// Retrieve code, state, and verifier from URL and cookies
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const codeVerifier = event.cookies.get('google_oauth_code_verifier');
	const storedState = event.cookies.get('google_oauth_state') ?? null;

	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		// Exchange the code for tokens
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		// Fetch the Google user profile using the access token
		const googleUserResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const googleUser: GoogleUser = await googleUserResponse.json();

		// Check if a user with the given Google ID already exists in the database
		const existingGoogleUser = await db
			.select()
			.from(users)
			.where(eq(users.googleId, googleUser.sub))
			.get();

		let userId: string;

		if (existingGoogleUser) {
			// User already exists, use their ID
			userId = existingGoogleUser.id;
		} else {
			// User does not exist, create a new user in the database
			userId = crypto.randomUUID();
			await db.insert(users).values({
				id: userId,
				userName: googleUser.name,
				email: googleUser.email,
				googleId: googleUser.sub,
				hashedPassword: crypto.randomUUID() // Placeholder for hashed password
			});
		}

		// Create a session for the user using Lucia
		const session = await lucia.createSession(userId, {});

		// Create a session cookie for the session
		const sessionCookie = lucia.createSessionCookie(session.id);

		// Set the sessionId cookie
		event.cookies.set('sessionId', session.id, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 // 1 day
		});

		// Redirect to the home page after successful login
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}
