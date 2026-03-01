import { Router } from 'express';
import { z } from 'zod';
import { register, login, logout, me, refresh } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1).optional()
});

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/logout', validate(logoutSchema), logout);
authRouter.get('/me', requireAuth, me);
authRouter.post('/refresh', validate(refreshSchema), refresh);
