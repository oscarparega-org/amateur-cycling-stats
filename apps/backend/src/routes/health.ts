import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

const health = new Hono();

health.get('/', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch {
    return c.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      },
      503
    );
  }
});

export { health };
