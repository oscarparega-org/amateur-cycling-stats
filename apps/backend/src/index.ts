import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { registerRoutes } from './routes/index.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use('*', errorHandler);

// Routes
registerRoutes(app);

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
