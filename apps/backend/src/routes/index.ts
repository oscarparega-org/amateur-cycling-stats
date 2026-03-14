import { Hono } from 'hono';
import { health } from './health.js';

export function registerRoutes(app: Hono) {
  app.route('/health', health);
}
