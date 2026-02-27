import { fail } from '../utils/response.js';

const METHODS_TO_PROTECT = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SKIP_PATHS = new Set(['/api/auth/login', '/api/auth/register', '/api/health']);

export function csrfProtection(req, res, next) {
  if (!METHODS_TO_PROTECT.has(req.method)) return next();
  if (SKIP_PATHS.has(req.path)) return next();

  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return fail(res, 403, 'Invalid CSRF token');
  }

  return next();
}
