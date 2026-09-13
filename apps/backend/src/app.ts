import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { createSessionMiddleware } from './middleware/session.js';
import { auth as defaultAuth } from './lib/auth.js';
import { registerRoutes } from './routes/index.js';
import type { AppVariables } from './types/app.js';

type AuthInstance = typeof defaultAuth;

export function createApp(auth: AuthInstance = defaultAuth) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use(
    '*',
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
      credentials: true
    })
  );
  app.use('*', createSessionMiddleware(auth));
  app.onError(errorHandler);

  registerRoutes(app);
  app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

  return app;
}
