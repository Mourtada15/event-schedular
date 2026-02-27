import { verifyAccessToken } from '../utils/jwt.js';
import { fail } from '../utils/response.js';

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) return fail(res, 401, 'Unauthorized');

    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') return fail(res, 401, 'Unauthorized');

    req.user = { id: payload.sub };
    return next();
  } catch (error) {
    return fail(res, 401, 'Unauthorized');
  }
}

export function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      req.user = null;
      return next();
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      req.user = null;
      return next();
    }

    req.user = { id: payload.sub };
    return next();
  } catch {
    req.user = null;
    return next();
  }
}
