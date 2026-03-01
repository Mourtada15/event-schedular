import { verifyAccessToken } from '../utils/jwt.js';
import { fail } from '../utils/response.js';

function getBearerToken(req) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (!/^Bearer$/i.test(scheme) || !token) {
    return null;
  }

  return token;
}

export function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
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
    const token = getBearerToken(req);
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
