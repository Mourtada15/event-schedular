import { ZodError } from 'zod';
import { fail } from '../utils/response.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source];
      const parsed = schema.parse(data);
      req[source] = parsed;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(res, 400, 'Validation failed', error.flatten());
      }
      return next(error);
    }
  };
}
