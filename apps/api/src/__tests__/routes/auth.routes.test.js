import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockRefresh = jest.fn();
const mockLogout = jest.fn();
const mockMe = jest.fn();

jest.unstable_mockModule('../../controllers/auth.controller.js', () => ({
  register: mockRegister,
  login: mockLogin,
  refresh: mockRefresh,
  logout: mockLogout,
  me: mockMe,
}));

jest.unstable_mockModule('../../middleware/auth.js', () => ({
  requireAuth: jest.fn((req, res, next) => {
    req.user = { id: 'user123', email: 'test@example.com' };
    next();
  }),
}));

jest.unstable_mockModule('../../middleware/csrf.js', () => ({
  csrfProtect: jest.fn((req, res, next) => next()),
}));

const { errorHandler } = await import('../../middleware/errorHandler.js');
const authRoutes = (await import('../../routes/auth.routes.js')).default;

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 and user data for valid registration', async () => {
      const userData = { email: 'test@example.com', password: 'Password123!', name: 'Test User' };
      mockRegister.mockImplementation((req, res) => {
        res.status(201).json({ user: { id: 'user123', email: userData.email, name: userData.name } });
      });

      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(userData.email);
    });

    it('returns 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'invalid-email', password: 'Password123!', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for weak password (no uppercase)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'password123!', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for weak password (no number)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'PasswordABC!', name: 'Test' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for name too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'Password123!', name: 'T' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for unknown fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'Password123!', name: 'Test', unknown: 'field' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 and sets cookies for valid login', async () => {
      mockLogin.mockImplementation((req, res) => {
        res.status(200).json({ user: { id: 'user123', email: 'test@example.com' } });
      });

      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(res.status).toBe(200);
    });

    it('returns 401 for wrong password', async () => {
      mockLogin.mockImplementation(() => {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
      });

      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
    });

    it('returns 400 for unknown fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'Password123!', unknown: 'field' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 200 and user when authenticated', async () => {
      mockMe.mockImplementation((req, res) => {
        res.status(200).json({ user: { id: 'user123', email: 'test@example.com' } });
      });

      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 200 and clears cookies', async () => {
      mockLogout.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Logged out successfully' });
      });

      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});