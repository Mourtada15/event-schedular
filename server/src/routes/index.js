import { Router } from 'express';
import { ok } from '../utils/response.js';
import { authRouter } from './auth.routes.js';
import { eventRouter } from './event.routes.js';
import { inviteRouter } from './invite.routes.js';
import { aiRouter } from './ai.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => ok(res, { status: 'healthy' }));
apiRouter.use('/auth', authRouter);
apiRouter.use('/events', eventRouter);
apiRouter.use('/invites', inviteRouter);
apiRouter.use('/ai', aiRouter);
