import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { RequestValidationError } from '../lib/validation.js';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  if (err instanceof RequestValidationError) {
    return c.json({ error: err.message, code: 'VALIDATION_ERROR', issues: err.issues }, 400);
  }
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
};
