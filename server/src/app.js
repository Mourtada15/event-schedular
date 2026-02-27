import express from 'express';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { applySecurity } from './middleware/security.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  applySecurity(app);

  app.use(express.json({ limit: '1mb' }));
  app.use(mongoSanitize());
  app.use(cookieParser());
  app.use(csrfProtection);

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
