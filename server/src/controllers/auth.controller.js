import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { createSession, revokeRefreshToken, rotateRefreshToken } from '../services/sessionService.js';
import { createStarterEventsForUser } from '../services/starterEventsService.js';
import { ok, fail } from '../utils/response.js';

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    invitedBy: user.invitedBy || null,
    createdAt: user.createdAt
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return fail(res, 400, 'Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    await createStarterEventsForUser(user._id);
    const tokens = await createSession(user._id.toString());

    return ok(res, { user: sanitizeUser(user), tokens }, 201);
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return fail(res, 401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return fail(res, 401, 'Invalid credentials');
    const tokens = await createSession(user._id.toString());

    return ok(res, { user: sanitizeUser(user), tokens });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);

    return ok(res, { message: 'Logged out' });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return fail(res, 404, 'User not found');

    return ok(res, { user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken: rawRefreshToken } = req.body;
    if (!rawRefreshToken) return fail(res, 401, 'Missing refresh token');

    const { userId, tokens } = await rotateRefreshToken(rawRefreshToken);
    const user = await User.findById(userId);
    if (!user) return fail(res, 401, 'Invalid session');

    return ok(res, { user: sanitizeUser(user), tokens });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.status === 401) {
      return fail(res, 401, 'Invalid refresh token');
    }

    return next(error);
  }
}
