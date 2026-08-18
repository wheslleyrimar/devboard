import { prisma } from '../config/prisma.js';
import { HttpError } from '../domain/httpError.js';
import { TASK_STATUSES, TASK_PRIORITIES } from '../domain/constants.js';
import { touchProjectUpdatedAt } from './projects.service.js';

function validateTaskInput({ title, desc, priority, status }) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new HttpError(400, 'title é obrigatório');
  }
  if (!desc || typeof desc !== 'string' || !desc.trim()) {
    throw new HttpError(400, 'desc é obrigatório');
  }
  if (!TASK_PRIORITIES.includes(priority)) {
    throw new HttpError(400, `priority deve ser um de: ${TASK_PRIORITIES.join(', ')}`);
  }
  if (!TASK_STATUSES.includes(status)) {
    throw new HttpError(400, `status deve ser um de: ${TASK_STATUSES.join(', ')}`);
  }
}

export async function createTask(projectId, input) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new HttpError(404, 'Projeto não encontrado');

  validateTaskInput(input);
  const { title, desc, priority, status } = input;

  const task = await prisma.task.create({
    data: { title: title.trim(), desc: desc.trim(), priority, status, projectId },
  });

  await touchProjectUpdatedAt(projectId);

  return task;
}
