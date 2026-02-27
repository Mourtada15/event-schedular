import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export function applySecurity(app) {
  const allowedOrigins = new Set(env.clientOrigins);
  const corsOptions = env.isProduction
    ? {
        origin(origin, callback) {
          if (!origin) return callback(null, true);
          return callback(null, allowedOrigins.has(origin));
        },
        credentials: true
      }
    : {
        origin: true,
        credentials: true
      };

  app.use(helmet());
  app.use(cors(corsOptions));
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
