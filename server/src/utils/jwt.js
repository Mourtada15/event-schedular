import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId, type: 'access' }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl
  });
}

export function signRefreshToken(userId, tokenId) {
  return jwt.sign({ sub: userId, type: 'refresh', tid: tokenId }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTokenTtlDays}d`
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}
