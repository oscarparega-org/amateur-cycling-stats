import { Hono } from 'hono';
import * as catService from '../services/categories.service.js';

const categories = new Hono();

// === Age ===
categories.get('/age', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getAgeCategories(organizationId || undefined));
});

categories.post('/age', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const cat = await catService.createAgeCategory(body);
  return c.json(cat, 201);
});

categories.patch('/age/:id', async (c) => {
  const cat = await catService.updateAgeCategory(c.req.param('id'), await c.req.json());
  if (!cat) return c.json({ error: 'Not found' }, 404);
  return c.json(cat);
});

categories.delete('/age/:id', async (c) => {
  const result = await catService.deleteAgeCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

// === Gender ===
categories.get('/gender', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getGenderCategories(organizationId || undefined));
});

categories.post('/gender', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const cat = await catService.createGenderCategory(body);
  return c.json(cat, 201);
});

categories.patch('/gender/:id', async (c) => {
  const cat = await catService.updateGenderCategory(c.req.param('id'), await c.req.json());
  if (!cat) return c.json({ error: 'Not found' }, 404);
  return c.json(cat);
});

categories.delete('/gender/:id', async (c) => {
  const result = await catService.deleteGenderCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

// === Distance ===
categories.get('/distance', async (c) => {
  const organizationId = c.req.query('organizationId');
  return c.json(await catService.getDistanceCategories(organizationId || undefined));
});

categories.post('/distance', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'name is required' }, 400);
  const cat = await catService.createDistanceCategory(body);
  return c.json(cat, 201);
});

categories.patch('/distance/:id', async (c) => {
  const cat = await catService.updateDistanceCategory(c.req.param('id'), await c.req.json());
  if (!cat) return c.json({ error: 'Not found' }, 404);
  return c.json(cat);
});

categories.delete('/distance/:id', async (c) => {
  const result = await catService.deleteDistanceCategory(c.req.param('id'));
  if (result.errorCode === 'NOT_FOUND') return c.json({ error: 'Not found' }, 404);
  if (result.errorCode) return c.json({ error: 'Cannot delete category', code: result.errorCode }, 409);
  return c.json({ success: true });
});

export { categories };
