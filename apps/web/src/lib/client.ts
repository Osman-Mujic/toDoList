import { PUBLIC_API_BASE_URL } from '$env/static/public';
import type { AppType } from '@todo/api/src/index';
import { hc } from 'hono/client';
import { getAuthHeader } from './auth';

export const client = hc<AppType>(PUBLIC_API_BASE_URL, {
	headers: {
		Authorization: (await getAuthHeader()) ?? ''
	}
});
