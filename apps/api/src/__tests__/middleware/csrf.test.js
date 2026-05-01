import { jest } from '@jest/globals';

process.env.CSRF_TOKEN_LENGTH = '64';
process.env.CSRF_COOKIE_SAMESITE = 'lax';
process.env.CSRF_COOKIE_DOMAIN = '';
process.env.CSRF_COOKIE_SECURE = 'false';

const mockReq = (overrides = {}) => ({
  method: 'POST',
  cookies: {},
  headers: {},
  ...overrides,
});
const mockRes = () => {
  const res = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

const VALID_TOKEN = 'a'.repeat(64);

describe('CSRF Middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.CSRF_TOKEN_LENGTH = '64';
    process.env.CSRF_COOKIE_SAMESITE = 'lax';
    process.env.CSRF_COOKIE_DOMAIN = '';
    process.env.CSRF_COOKIE_SECURE = 'false';
  });

  afterEach(() => {
    delete process.env.CSRF_TOKEN_LENGTH;
    delete process.env.CSRF_COOKIE_SAMESITE;
    delete process.env.CSRF_COOKIE_DOMAIN;
    delete process.env.CSRF_COOKIE_SECURE;
  });

  describe('csrfProtect', () => {
    let csrfProtect;
    beforeEach(async () => {
      const mod = await import('../../middleware/csrf.js');
      csrfProtect = mod.csrfProtect;
    });

    it('skips GET/HEAD/OPTIONS requests', () => {
      const res = mockRes();
      const next = jest.fn();
      ['GET', 'HEAD', 'OPTIONS'].forEach((method) => {
        next.mockClear();
        csrfProtect(mockReq({ method }), res, next);
        expect(next).toHaveBeenCalledWith();
      });
    });

    it('returns 403 when csrf_token cookie is missing', () => {
      const req = mockReq({ method: 'POST', cookies: {}, headers: {} });
      const res = mockRes();
      const next = jest.fn();
      csrfProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('CSRF token missing');
    });

    it('returns 403 when X-CSRF-Token header is missing', () => {
      const req = mockReq({ method: 'POST', cookies: { csrf_token: VALID_TOKEN }, headers: {} });
      const res = mockRes();
      const next = jest.fn();
      csrfProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('CSRF token missing');
    });

    it('returns 403 when cookie length is wrong', () => {
      const req = mockReq({
        method: 'POST',
        cookies: { csrf_token: 'short' },
        headers: { 'x-csrf-token': VALID_TOKEN },
      });
      const res = mockRes();
      const next = jest.fn();
      csrfProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('CSRF token mismatch');
    });

    it('returns 403 when header length is wrong', () => {
      const req = mockReq({
        method: 'POST',
        cookies: { csrf_token: VALID_TOKEN },
        headers: { 'x-csrf-token': 'short' },
      });
      const res = mockRes();
      const next = jest.fn();
      csrfProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('CSRF token mismatch');
    });

    it('returns 403 when tokens do not match', () => {
      const req = mockReq({
        method: 'POST',
        cookies: { csrf_token: 'b'.repeat(64) },
        headers: { 'x-csrf-token': 'c'.repeat(64) },
      });
      const res = mockRes();
      const next = jest.fn();
      csrfProtect(req, res, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('CSRF token mismatch');
    });

    it('calls next without error when tokens match', () => {
      const req = mockReq({
        method: 'POST',
        cookies: { csrf_token: VALID_TOKEN },
        headers: { 'x-csrf-token': VALID_TOKEN },
      });
      const res = mockRes();
      const next = jest.fn();
      csrfProtect(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('generateCsrfToken', () => {
    beforeEach(() => {
      process.env.CSRF_TOKEN_LENGTH = '64';
    });

    it('generates hex string matching CSRF_TOKEN_LENGTH', async () => {
      jest.resetModules();
      const { generateCsrfToken, CSRF_TOKEN_LENGTH } = await import('../../middleware/csrf.js');
      const token = generateCsrfToken();
      expect(token).toHaveLength(CSRF_TOKEN_LENGTH);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('generates unique tokens', async () => {
      jest.resetModules();
      const { generateCsrfToken } = await import('../../middleware/csrf.js');
      const t1 = generateCsrfToken();
      const t2 = generateCsrfToken();
      expect(t1).not.toBe(t2);
    });

    it('uses length from CSRF_TOKEN_LENGTH env', async () => {
      process.env.CSRF_TOKEN_LENGTH = '32';
      jest.resetModules();
      const { generateCsrfToken, CSRF_TOKEN_LENGTH } = await import('../../middleware/csrf.js');
      expect(CSRF_TOKEN_LENGTH).toBe(32);
      expect(generateCsrfToken()).toHaveLength(32);
    });
  });

  describe('CSRF_TOKEN_LENGTH validation', () => {
    it('throws when CSRF_TOKEN_LENGTH is missing', async () => {
      delete process.env.CSRF_TOKEN_LENGTH;
      await expect(import('../../middleware/csrf.js')).rejects.toThrow();
    });

    it('throws when CSRF_TOKEN_LENGTH is not a number', async () => {
      process.env.CSRF_TOKEN_LENGTH = 'not-a-number';
      await expect(import('../../middleware/csrf.js')).rejects.toThrow();
    });

    it('throws when CSRF_TOKEN_LENGTH is too small (<32)', async () => {
      process.env.CSRF_TOKEN_LENGTH = '30';
      await expect(import('../../middleware/csrf.js')).rejects.toThrow();
    });

    it('throws when CSRF_TOKEN_LENGTH is odd', async () => {
      process.env.CSRF_TOKEN_LENGTH = '65';
      await expect(import('../../middleware/csrf.js')).rejects.toThrow();
    });

    it('throws when CSRF_TOKEN_LENGTH is not an integer', async () => {
      process.env.CSRF_TOKEN_LENGTH = '64.5';
      await expect(import('../../middleware/csrf.js')).rejects.toThrow();
    });
  });

  describe('setCsrfCookie / clearCsrfCookie', () => {
    it('sets non-httpOnly cookie with configured samesite', async () => {
      process.env.CSRF_COOKIE_SAMESITE = 'lax';
      process.env.CSRF_COOKIE_DOMAIN = '';
      process.env.CSRF_COOKIE_SECURE = 'false';
      jest.resetModules();
      const { setCsrfCookie } = await import('../../middleware/csrf.js');
      const res = mockRes();
      setCsrfCookie(res, 'token123');
      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        'token123',
        expect.objectContaining({ httpOnly: false, sameSite: 'lax', secure: false })
      );
    });

    it('includes domain when CSRF_COOKIE_DOMAIN is set', async () => {
      process.env.CSRF_COOKIE_DOMAIN = '.example.com';
      process.env.CSRF_COOKIE_SAMESITE = 'strict';
      process.env.CSRF_COOKIE_SECURE = 'true';
      jest.resetModules();
      const { setCsrfCookie } = await import('../../middleware/csrf.js');
      const res = mockRes();
      setCsrfCookie(res, 'token123');
      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        'token123',
        expect.objectContaining({ domain: '.example.com', sameSite: 'strict', secure: true })
      );
    });

    it('clears cookie with maxAge 0', async () => {
      const { clearCsrfCookie } = await import('../../middleware/csrf.js');
      const res = mockRes();
      clearCsrfCookie(res);
      expect(res.clearCookie).toHaveBeenCalledWith(
        'csrf_token',
        expect.objectContaining({ maxAge: 0 })
      );
    });
  });

  describe('CSRF_COOKIE_SAMESITE validation', () => {
    it('falls back to lax for invalid sameSite value with warning', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.CSRF_COOKIE_SAMESITE = 'invalid-value';
      jest.resetModules();
      const { setCsrfCookie } = await import('../../middleware/csrf.js');
      const res = mockRes();
      setCsrfCookie(res, 'token123');
      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        'token123',
        expect.objectContaining({ sameSite: 'lax' })
      );
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid CSRF_COOKIE_SAMESITE'));
      warnSpy.mockRestore();
    });

    it('accepts strict, lax, none', async () => {
      for (const value of ['strict', 'lax', 'none']) {
        process.env.CSRF_COOKIE_SAMESITE = value;
        jest.resetModules();
        const { setCsrfCookie } = await import('../../middleware/csrf.js');
        const res = mockRes();
        setCsrfCookie(res, 'token123');
        expect(res.cookie).toHaveBeenCalledWith(
          'csrf_token',
          'token123',
          expect.objectContaining({ sameSite: value })
        );
      }
    });
  });

  describe('CSRF_COOKIE_SECURE env-driven', () => {
    it('uses CSRF_COOKIE_SECURE env when set to true', async () => {
      process.env.CSRF_COOKIE_SECURE = 'true';
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      const { setCsrfCookie } = await import('../../middleware/csrf.js');
      const res = mockRes();
      setCsrfCookie(res, 'token123');
      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        'token123',
        expect.objectContaining({ secure: true })
      );
    });

    it('uses NODE_ENV fallback when CSRF_COOKIE_SECURE is not set', async () => {
      delete process.env.CSRF_COOKIE_SECURE;
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const { setCsrfCookie } = await import('../../middleware/csrf.js');
      const res = mockRes();
      setCsrfCookie(res, 'token123');
      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        'token123',
        expect.objectContaining({ secure: true })
      );
    });
  });
});