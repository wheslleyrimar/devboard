import { Router } from 'express';
import * as projectsController from '../controllers/projects.controller.js';
import tasksRoutes from './tasks.routes.js';

const router = Router();

router.get('/', projectsController.index);
router.post('/', projectsController.create);
router.get('/:id', projectsController.show);
router.use('/:projectId/tasks', tasksRoutes);

export default router;
