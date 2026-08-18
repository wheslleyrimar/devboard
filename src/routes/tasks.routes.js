import { Router } from 'express';
import * as tasksController from '../controllers/tasks.controller.js';

const router = Router({ mergeParams: true });

router.post('/', tasksController.create);

export default router;
