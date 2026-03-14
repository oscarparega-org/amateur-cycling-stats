import { Hono } from 'hono';
import { health } from './health.js';
import { organizations } from './organizations.js';

export function registerRoutes(app: Hono) {
  app.route('/health', health);
  app.route('/api/organizations', organizations);
}
