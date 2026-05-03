import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockRemove = jest.fn();

jest.unstable_mockModule('../../controllers/workspace.controller.js', () => ({
  list: mockList,
  create: mockCreate,
  remove: mockRemove,
  getById: jest.fn(),
  update: jest.fn(),
  invite: jest.fn(),
  updateRole: jest.fn(),
  removeMember: jest.fn(),
}));

jest.unstable_mockModule('../../middleware/auth.js', () => ({
  requireAuth: jest.fn((req, res, next) => {
    req.user = { id: 'user123' };
    next();
  }),
}));

jest.unstable_mockModule('../../middleware/rbac.js', () => ({
  requireWorkspaceMember: jest.fn((req, res, next) => next()),
  requireRole: jest.fn(() => (req, res, next) => next()),
}));

jest.unstable_mockModule('../../middleware/csrf.js', () => ({
  csrfProtect: jest.fn((req, res, next) => next()),
}));

const { errorHandler } = await import('../../middleware/errorHandler.js');
const workspaceRoutes = (await import('../../routes/workspace.routes.js')).default;

describe('Workspace Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/workspaces', workspaceRoutes);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('GET /api/workspaces', () => {
    it('returns 200 and list of workspaces', async () => {
      mockList.mockImplementation((req, res) => {
        res.status(200).json([{ id: 'ws1', name: 'WS1' }]);
      });

      const res = await request(app).get('/api/workspaces');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /api/workspaces', () => {
    it('returns 201 for valid creation', async () => {
      mockCreate.mockImplementation((req, res) => {
        res.status(201).json({ id: 'ws2', name: 'WS2' });
      });

      const res = await request(app)
        .post('/api/workspaces')
        .send({ name: 'WS2' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('WS2');
    });

    it('returns 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/workspaces')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/workspaces/:workspaceId', () => {
    it('calls remove controller', async () => {
      mockRemove.mockImplementation((req, res) => {
        res.status(204).end();
      });

      const res = await request(app).delete('/api/workspaces/ws1');

      expect(res.status).toBe(204);
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});
