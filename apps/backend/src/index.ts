import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { sessionMiddleware } from './middleware/session.js';
import { auth } from './lib/auth.js';
import { registerRoutes } from './routes/index.js';
import type { AppVariables } from './types/app.js';

const app = new Hono<{ Variables: AppVariables }>();

// Middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use('*', errorHandler);
app.use('*', sessionMiddleware);

// Application routes (includes custom /api/auth/complete-organizer-setup)
// MUST be registered BEFORE the BetterAuth wildcard handler
registerRoutes(app);

// BetterAuth routes (wildcard — catches all remaining /api/auth/* requests)
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
