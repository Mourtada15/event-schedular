import { fail } from '../utils/response.js';

export function notFoundHandler(req, res) {
  return fail(res, 404, 'Route not found');
}

export function errorHandler(err, req, res, next) {
  if (err && err.name === 'CastError') {
    return fail(res, 400, 'Invalid identifier');
  }

  if (err && err.name === 'ValidationError') {
    return fail(res, 400, err.message);
  }

  if (err && err.code === 11000) {
    return fail(res, 400, 'Duplicate field value');
  }

  const status = err.status || 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  return fail(res, status, err.message || 'Internal server error', err.details);
}
