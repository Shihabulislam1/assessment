import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockList = jest.fn();
const mockExportCsv = jest.fn();

jest.unstable_mockModule('../../controllers/audit.controller.js', () => ({
  list: mockList,
  exportCsv: mockExportCsv,
}));

jest.unstable_mockModule('../../middleware/auth.js', () => ({
  requireAuth: jest.fn((req, res, next) => {
    req.user = { id: 'user123' };
    next();
  }),
}));

// Mock rbac middleware to simulate role checks based on a request header for testing purposes
jest.unstable_mockModule('../../middleware/rbac.js', () => ({
  requireWorkspaceMember: jest.fn((req, res, next) => {
    req.membership = { role: req.headers['x-test-role'] || 'MEMBER' };
    next();
  }),
  requireRole: jest.fn((allowedRole) => {
    return (req, res, next) => {
      if (req.membership.role !== allowedRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    };
  }),
}));

const auditRoutes = (await import('../../routes/audit.routes.js')).default;

describe('Audit Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // audit.routes uses mergeParams, typically mounted under /api/workspaces/:workspaceId/audit-log
    app.use('/api/workspaces/:workspaceId/audit-log', auditRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/workspaces/:workspaceId/audit-log', () => {
    it('returns 200 for ADMIN role', async () => {
      mockList.mockImplementation((req, res) => {
        res.status(200).json([]);
      });

      const res = await request(app)
        .get('/api/workspaces/ws1/audit-log')
        .set('x-test-role', 'ADMIN');

      expect(res.status).toBe(200);
      expect(mockList).toHaveBeenCalled();
    });

    it('returns 403 for non-ADMIN role', async () => {
      const res = await request(app)
        .get('/api/workspaces/ws1/audit-log')
        .set('x-test-role', 'MEMBER');

      expect(res.status).toBe(403);
      expect(mockList).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/workspaces/:workspaceId/audit-log/export', () => {
    it('returns 200 for ADMIN role', async () => {
      mockExportCsv.mockImplementation((req, res) => {
        res.status(200).send('csv');
      });

      const res = await request(app)
        .get('/api/workspaces/ws1/audit-log/export')
        .set('x-test-role', 'ADMIN');

      expect(res.status).toBe(200);
      expect(mockExportCsv).toHaveBeenCalled();
    });

    it('returns 403 for non-ADMIN role', async () => {
      const res = await request(app)
        .get('/api/workspaces/ws1/audit-log/export')
        .set('x-test-role', 'MEMBER');

      expect(res.status).toBe(403);
      expect(mockExportCsv).not.toHaveBeenCalled();
    });
  });
});
