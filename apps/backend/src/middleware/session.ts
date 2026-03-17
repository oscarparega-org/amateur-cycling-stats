import type { Context, Next } from 'hono';
import type { AppVariables } from '../types/app.js';
import { auth } from '../lib/auth.js';

export async function sessionMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('user', session?.user ?? null);
  c.set('session', session?.session ?? null);
  await next();
}
