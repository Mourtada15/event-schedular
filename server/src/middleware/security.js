import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export function applySecurity(app) {
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        ok: false,
        error: {
          message: 'Too many requests, please try again later.'
        }
      }
    })
  );

  if (!env.isProduction) {
    app.use(morgan('dev'));
  }
}
