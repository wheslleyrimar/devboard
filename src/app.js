import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import projectsRoutes from './routes/projects.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/projects', projectsRoutes);

  app.use(errorHandler);

  return app;
}
