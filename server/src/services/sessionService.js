import { RefreshToken } from '../models/RefreshToken.js';
import { env } from '../config/env.js';
import { randomToken, sha256 } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

function refreshExpiryDate() {
  return new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
}

export async function createSession(userId) {
  const tokenId = randomToken(16);
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId, tokenId);

  await RefreshToken.create({
    userId,
    tokenHash: sha256(refreshToken),
    expiresAt: refreshExpiryDate()
  });

  return {
    accessToken,
    refreshToken
  };
}

export async function revokeRefreshToken(rawRefreshToken) {
  if (!rawRefreshToken) return;
  await RefreshToken.deleteOne({ tokenHash: sha256(rawRefreshToken) });
}

export async function rotateRefreshToken(rawRefreshToken) {
  const payload = verifyRefreshToken(rawRefreshToken);
  if (payload.type !== 'refresh') {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const existing = await RefreshToken.findOne({ tokenHash: sha256(rawRefreshToken) });
  if (!existing || existing.expiresAt < new Date()) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  await RefreshToken.deleteOne({ _id: existing._id });
  const tokens = await createSession(existing.userId.toString());

  return { userId: existing.userId.toString(), tokens };
}
