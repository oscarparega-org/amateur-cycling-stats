import type { Hono } from 'hono';
import { health } from './health.js';
import { organizations } from './organizations.js';
import { categories, eventCategories, organizationCategories } from './categories.js';
import { events } from './events.js';
import { races } from './races.js';
import { cyclists } from './cyclists.js';
import { raceResults } from './race-results.js';
import { organizers } from './organizers.js';
import { invitations } from './invitations.js';
import { authSetup } from './auth-setup.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerRoutes(app: Hono<any>) {
  app.route('/health', health);
  app.route('/api/auth', authSetup);
  app.route('/api/organizations', organizations);
  app.route('/api/categories', categories);
  app.route('/api/organizations/:organizationId/categories', organizationCategories);
  app.route('/api/events/:eventId/categories', eventCategories);
  app.route('/api/events', events);
  app.route('/api/races', races);
  app.route('/api/cyclists', cyclists);
  app.route('/api/race-results', raceResults);
  app.route('/api/organizers', organizers);
  app.route('/api/invitations', invitations);
}
