import crypto from 'crypto';
import { env } from './env.js';

const sameSite = env.isProduction ? 'none' : 'lax';

function baseCookieOptions(maxAgeMs, httpOnly = true) {
  return {
    httpOnly,
    secure: env.isProduction ? true : env.cookieSecure,
    sameSite,
    maxAge: maxAgeMs,
    path: '/'
  };
}

export function setAuthCookies(res, accessToken, refreshToken, refreshDays) {
  const accessMs = 15 * 60 * 1000;
  const refreshMs = refreshDays * 24 * 60 * 60 * 1000;
  const csrfToken = crypto.randomBytes(24).toString('hex');

  res.cookie('accessToken', accessToken, baseCookieOptions(accessMs, true));
  res.cookie('refreshToken', refreshToken, baseCookieOptions(refreshMs, true));
  res.cookie('csrfToken', csrfToken, baseCookieOptions(refreshMs, false));
}

export function clearAuthCookies(res) {
  const options = {
    httpOnly: true,
    secure: env.isProduction ? true : env.cookieSecure,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/'
  };

  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
  res.clearCookie('csrfToken', { ...options, httpOnly: false });
}
