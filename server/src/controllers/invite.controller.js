import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Invitation } from '../models/Invitation.js';
import { User } from '../models/User.js';
import { createSession } from '../services/sessionService.js';
import { createStarterEventsForUser } from '../services/starterEventsService.js';
import { sendInviteEmail } from '../services/emailService.js';
import { randomToken, sha256 } from '../utils/crypto.js';
import { fail, ok } from '../utils/response.js';

const acceptSchema = z.object({
  token: z.string().min(8),
  name: z.string().min(2).max(80).optional(),
  password: z.string().min(8).max(128).optional(),
  email: z.string().email().optional()
});

export async function createInvite(req, res, next) {
  try {
    const { email } = req.body;
    const rawToken = randomToken(32);
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + env.inviteTokenTtlHours * 60 * 60 * 1000);

    await Invitation.create({
      inviterId: req.user.id,
      email: email || null,
      tokenHash,
      expiresAt
    });

    const inviteLink = `${env.clientOrigin}/accept-invite?token=${rawToken}`;
    let emailResult = { sent: false, reason: 'no_email_provided' };

    if (email) {
      const inviter = await User.findById(req.user.id);
      emailResult = await sendInviteEmail(email, inviteLink, (inviter && inviter.name) || 'A user');
    }

    return ok(res, { inviteLink, emailResult }, 201);
  } catch (error) {
    return next(error);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const parsed = acceptSchema.parse(req.body);

    const invitation = await Invitation.findOne({
      tokenHash: sha256(parsed.token),
      acceptedAt: null
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      return fail(res, 400, 'Invalid or expired invitation token');
    }

    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (!user) return fail(res, 401, 'Unauthorized');

      if (!user.invitedBy && user._id.toString() !== invitation.inviterId.toString()) {
        user.invitedBy = invitation.inviterId;
        await user.save();
      }

      invitation.acceptedAt = new Date();
      await invitation.save();

      return ok(res, { message: 'Invitation accepted for current account' });
    }

    if (!parsed.name || !parsed.password) {
      return fail(res, 400, 'name and password are required for new account acceptance');
    }

    const targetEmail = invitation.email || parsed.email;
    if (!targetEmail) {
      return fail(res, 400, 'email is required for this invitation');
    }

    const existing = await User.findOne({ email: targetEmail });
    if (existing) {
      return fail(res, 400, 'User with this email already exists, please login and accept invite');
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    const user = await User.create({
      name: parsed.name,
      email: targetEmail,
      passwordHash,
      invitedBy: invitation.inviterId
    });
    await createStarterEventsForUser(user._id);

    invitation.acceptedAt = new Date();
    await invitation.save();

    const tokens = await createSession(user._id.toString());

    return ok(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          invitedBy: user.invitedBy
        },
        tokens
      },
      201
    );
  } catch (error) {
    if (error.name === 'ZodError') {
      return fail(res, 400, 'Validation failed', error.flatten());
    }
    return next(error);
  }
}
