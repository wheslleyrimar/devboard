import { prisma } from '../config/prisma.js';
import { HttpError } from '../domain/httpError.js';
import { PROJECT_STATUSES } from '../domain/constants.js';

function validateProjectInput({ name, desc, stack, status }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new HttpError(400, 'name é obrigatório');
  }
  if (!desc || typeof desc !== 'string' || !desc.trim()) {
    throw new HttpError(400, 'desc é obrigatório');
  }
  if (!Array.isArray(stack) || stack.length === 0 || !stack.every((s) => typeof s === 'string' && s.trim())) {
    throw new HttpError(400, 'stack deve ser uma lista de strings não vazia');
  }
  if (!PROJECT_STATUSES.includes(status)) {
    throw new HttpError(400, `status deve ser um de: ${PROJECT_STATUSES.join(', ')}`);
  }
}

export async function listProjects({ status, search } = {}) {
  const where = {};
  if (status && status !== 'all') {
    if (!PROJECT_STATUSES.includes(status)) {
      throw new HttpError(400, `status deve ser um de: ${PROJECT_STATUSES.join(', ')}`);
    }
    where.status = status;
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { tasks: { select: { id: true } } },
  });

  if (!search || !search.trim()) return projects;

  const q = search.trim().toLowerCase();
  return projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.stack.some((s) => s.toLowerCase().includes(q)),
  );
}

export async function getProjectById(id) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { orderBy: { createdAt: 'desc' } } },
  });
  if (!project) throw new HttpError(404, 'Projeto não encontrado');
  return project;
}

export async function createProject(input) {
  validateProjectInput(input);
  const { name, desc, stack, status } = input;
  return prisma.project.create({
    data: { name: name.trim(), desc: desc.trim(), stack, status },
    include: { tasks: true },
  });
}

export async function touchProjectUpdatedAt(id) {
  await prisma.project.update({ where: { id }, data: { updatedAt: new Date() } });
}
