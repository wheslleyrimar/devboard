import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = {
  project: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  task: {
    create: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { createTask } = await import('../../src/services/tasks.service.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createTask', () => {
  it('throws 404 when the project does not exist', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);
    await expect(
      createTask('missing-id', { title: 'T', desc: 'd', priority: 'low', status: 'todo' }),
    ).rejects.toMatchObject({ status: 404 });
    expect(prismaMock.task.create).not.toHaveBeenCalled();
  });

  it('rejects invalid priority', async () => {
    prismaMock.project.findUnique.mockResolvedValue({ id: '1' });
    await expect(
      createTask('1', { title: 'T', desc: 'd', priority: 'urgent', status: 'todo' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects invalid status', async () => {
    prismaMock.project.findUnique.mockResolvedValue({ id: '1' });
    await expect(
      createTask('1', { title: 'T', desc: 'd', priority: 'low', status: 'blocked' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('creates the task and bumps the parent project updatedAt', async () => {
    prismaMock.project.findUnique.mockResolvedValue({ id: '1' });
    prismaMock.task.create.mockResolvedValue({ id: 't1', title: 'T' });

    await createTask('1', { title: '  T  ', desc: '  d  ', priority: 'low', status: 'todo' });

    expect(prismaMock.task.create).toHaveBeenCalledWith({
      data: { title: 'T', desc: 'd', priority: 'low', status: 'todo', projectId: '1' },
    });
    expect(prismaMock.project.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { updatedAt: expect.any(Date) },
    });
  });
});
