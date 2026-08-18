import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

const app = createApp();

beforeEach(async () => {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/projects', () => {
  it('creates a project and persists it in Postgres', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'Finance Tracker', desc: 'money app', stack: ['React'], status: 'active' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Finance Tracker', status: 'active', tasks: [] });

    const inDb = await prisma.project.findUnique({ where: { id: res.body.id } });
    expect(inDb).not.toBeNull();
  });

  it('rejects an invalid status with 400', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'X', desc: 'y', stack: ['JS'], status: 'archived' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/projects', () => {
  it('lists projects ordered by updatedAt desc and filters by status/search', async () => {
    const older = await prisma.project.create({
      data: { name: 'Old One', desc: 'first', stack: ['Go'], status: 'paused' },
    });
    await new Promise((r) => setTimeout(r, 50));
    const newer = await prisma.project.create({
      data: { name: 'New One', desc: 'second', stack: ['React'], status: 'active' },
    });

    const all = await request(app).get('/api/projects');
    expect(all.body.map((p) => p.id)).toEqual([newer.id, older.id]);

    const filtered = await request(app).get('/api/projects?status=paused');
    expect(filtered.body.map((p) => p.id)).toEqual([older.id]);

    const searched = await request(app).get('/api/projects?search=react');
    expect(searched.body.map((p) => p.id)).toEqual([newer.id]);
  });
});

describe('POST /api/projects/:id/tasks', () => {
  it('creates a task and bumps the parent project updatedAt', async () => {
    const project = await prisma.project.create({
      data: { name: 'App', desc: 'desc', stack: ['JS'], status: 'active' },
    });
    const originalUpdatedAt = project.updatedAt;

    await new Promise((r) => setTimeout(r, 50));

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .send({ title: 'Setup CI', desc: 'add pipeline', priority: 'high', status: 'todo' });

    expect(res.status).toBe(201);

    const refreshed = await prisma.project.findUnique({ where: { id: project.id } });
    expect(new Date(refreshed.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
  });

  it('returns 404 for an unknown project', async () => {
    const res = await request(app)
      .post('/api/projects/00000000-0000-0000-0000-000000000000/tasks')
      .send({ title: 'T', desc: 'd', priority: 'low', status: 'todo' });
    expect(res.status).toBe(404);
  });
});
