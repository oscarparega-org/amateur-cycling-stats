import type { Context, Next } from 'hono';
import type { AppVariables } from '../types/app.js';
import { auth } from '../lib/auth.js';

export function createSessionMiddleware(authInstance: typeof auth = auth) {
  return async function sessionMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
    const session = await authInstance.api.getSession({ headers: c.req.raw.headers });
    c.set('user', session?.user ?? null);
    c.set('session', session?.session ?? null);
    await next();
  };
}

export const sessionMiddleware = createSessionMiddleware();
