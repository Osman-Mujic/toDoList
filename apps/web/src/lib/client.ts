import type { AppType } from '@todo/api/src/index';
import { hc } from 'hono/client';

export const client = hc<AppType>('http://localhost:3000/');
