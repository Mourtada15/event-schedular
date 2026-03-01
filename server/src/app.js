import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { applySecurity } from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  applySecurity(app);

  app.use(express.json({ limit: '1mb' }));
  app.use(mongoSanitize());

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
