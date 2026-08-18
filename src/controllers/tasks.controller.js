import * as tasksService from '../services/tasks.service.js';

export async function create(req, res, next) {
  try {
    const task = await tasksService.createTask(req.params.projectId, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}
