import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = {
  project: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { listProjects, getProjectById, createProject } = await import('../../src/services/projects.service.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createProject', () => {
  it('rejects missing name', async () => {
    await expect(
      createProject({ name: '', desc: 'x', stack: ['JS'], status: 'active' }),
    ).rejects.toMatchObject({ status: 400 });
    expect(prismaMock.project.create).not.toHaveBeenCalled();
  });

  it('rejects missing desc', async () => {
    await expect(
      createProject({ name: 'App', desc: '  ', stack: ['JS'], status: 'active' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects empty stack', async () => {
    await expect(
      createProject({ name: 'App', desc: 'x', stack: [], status: 'active' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects invalid status', async () => {
    await expect(
      createProject({ name: 'App', desc: 'x', stack: ['JS'], status: 'archived' }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('creates a project with trimmed fields when valid', async () => {
    prismaMock.project.create.mockResolvedValue({ id: '1' });
    await createProject({ name: '  App  ', desc: '  desc  ', stack: ['JS'], status: 'active' });
    expect(prismaMock.project.create).toHaveBeenCalledWith({
      data: { name: 'App', desc: 'desc', stack: ['JS'], status: 'active' },
      include: { tasks: true },
    });
  });
});

describe('listProjects', () => {
  it('rejects invalid status filter', async () => {
    await expect(listProjects({ status: 'bogus' })).rejects.toMatchObject({ status: 400 });
  });

  it('filters results by search term across name, desc and stack', async () => {
    prismaMock.project.findMany.mockResolvedValue([
      { name: 'Finance Tracker', desc: 'money app', stack: ['React'], tasks: [] },
      { name: 'API Gateway', desc: 'cli tool', stack: ['Go'], tasks: [] },
    ]);
    const result = await listProjects({ search: 'react' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Finance Tracker');
  });
});

describe('getProjectById', () => {
  it('throws 404 when project does not exist', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);
    await expect(getProjectById('missing')).rejects.toMatchObject({ status: 404 });
  });
});
