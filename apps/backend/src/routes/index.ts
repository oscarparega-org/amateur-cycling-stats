import { Hono } from 'hono';
import { health } from './health.js';
import { organizations } from './organizations.js';
import { categories } from './categories.js';
import { events } from './events.js';

export function registerRoutes(app: Hono) {
  app.route('/health', health);
  app.route('/api/organizations', organizations);
  app.route('/api/categories', categories);
  app.route('/api/events', events);
}
