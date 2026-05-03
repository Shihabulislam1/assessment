import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockGetSummary = jest.fn();
const mockGetCharts = jest.fn();

jest.unstable_mockModule('../../controllers/analytics.controller.js', () => ({
  getSummary: mockGetSummary,
  getChartData: mockGetCharts,
  exportCsv: jest.fn(),
}));

jest.unstable_mockModule('../../middleware/auth.js', () => ({
  requireAuth: jest.fn((req, res, next) => {
    req.user = { id: 'user123' };
    next();
  }),
}));

jest.unstable_mockModule('../../middleware/rbac.js', () => ({
  requireWorkspaceMember: jest.fn((req, res, next) => next()),
}));

const { errorHandler } = await import('../../middleware/errorHandler.js');
const analyticsRoutes = (await import('../../routes/analytics.routes.js')).default;

describe('Analytics Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/workspaces/:workspaceId/analytics', analyticsRoutes);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('GET /api/workspaces/:workspaceId/analytics/summary', () => {
    it('returns 200 and summary data', async () => {
      mockGetSummary.mockImplementation((req, res) => {
        res.status(200).json({ totalGoals: 5 });
      });

      const res = await request(app).get('/api/workspaces/ws1/analytics/summary');

      expect(res.status).toBe(200);
      expect(res.body.totalGoals).toBe(5);
    });
  });
});
