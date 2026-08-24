import { serve } from '@hono/node-server';
import 'dotenv/config';
import { createApp } from './app.js';

const app = createApp();

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
