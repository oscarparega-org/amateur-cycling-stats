import type { Context } from 'hono';
import { z } from 'zod';

type ValidationIssue = {
  field: string;
  message: string;
};

export class RequestValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super('Invalid request');
    this.name = 'RequestValidationError';
    this.issues = issues;
  }
}

export async function parseJson<TSchema extends z.ZodType>(c: Context, schema: TSchema): Promise<z.infer<TSchema>> {
  let input: unknown;
  try {
    input = await c.req.json();
  } catch {
    throw new RequestValidationError([{ field: 'body', message: 'Must contain valid JSON' }]);
  }

  const result = schema.safeParse(input);
  if (!result.success) {
    throw new RequestValidationError(
      result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message
      }))
    );
  }
  return result.data;
}

export const uuid = z.string().uuid();
export const shortText = z.string().trim().min(1).max(200);
export const optionalText = z.string().trim().max(5_000).optional();
export const nullableOptionalText = z.string().trim().max(5_000).nullable().optional();
export const dateTime = z
  .string()
  .max(100)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Must be a valid date and time');

export function atLeastOneField<T extends z.ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'At least one field is required');
}
