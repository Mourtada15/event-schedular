import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createInvite, acceptInvite } from '../controllers/invite.controller.js';

export const inviteRouter = Router();

const createInviteSchema = z.object({
  email: z.string().email().optional()
});

inviteRouter.post('/create', requireAuth, validate(createInviteSchema), createInvite);
inviteRouter.post('/accept', optionalAuth, acceptInvite);
