import * as projectsService from '../services/projects.service.js';

export async function index(req, res, next) {
  try {
    const { status, search } = req.query;
    const projects = await projectsService.listProjects({ status, search });
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function show(req, res, next) {
  try {
    const project = await projectsService.getProjectById(req.params.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const project = await projectsService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}
