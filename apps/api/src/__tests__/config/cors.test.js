import { jest } from '@jest/globals';

describe('CORS config', () => {
  let corsFn;
  let callback;

  beforeEach(async () => {
    jest.resetModules();
    const mod = await import('../../config/cors.js');
    corsFn = mod.default;
    callback = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('origin matching', () => {
    it('allows exact match from CLIENT_URL list', async () => {
      process.env.CLIENT_URL = 'https://app.example.com,https://staging.example.com';
      jest.resetModules();
      const { default: fn } = await import('../../config/cors.js');
      fn({ headers: { origin: 'https://app.example.com' } }, callback);
      expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({ origin: 'https://app.example.com', credentials: true }));
    });

    it('rejects origin not in the list', async () => {
      process.env.CLIENT_URL = 'https://app.example.com';
      jest.resetModules();
      const { default: fn } = await import('../../config/cors.js');
      fn({ headers: { origin: 'https://evil.example.com' } }, callback);
      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('missing Origin header', () => {
    it('returns origin:false when Origin header is missing', () => {
      corsFn({ headers: {} }, callback);
      expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({ origin: false, credentials: false }));
    });
  });

  describe('isOriginAllowed', () => {
    it('returns true for allowed origin', async () => {
      process.env.CLIENT_URL = 'https://app.example.com';
      jest.resetModules();
      const { isOriginAllowed } = await import('../../config/cors.js');
      expect(isOriginAllowed('https://app.example.com')).toBe(true);
    });

    it('returns false for disallowed origin', async () => {
      process.env.CLIENT_URL = 'https://app.example.com';
      jest.resetModules();
      const { isOriginAllowed } = await import('../../config/cors.js');
      expect(isOriginAllowed('https://other.example.com')).toBe(false);
    });

    it('returns false for empty string', async () => {
      process.env.CLIENT_URL = 'https://app.example.com';
      jest.resetModules();
      const { isOriginAllowed } = await import('../../config/cors.js');
      expect(isOriginAllowed('')).toBe(false);
    });
  });

  describe('defaults', () => {
    it('defaults to localhost:3000 when CLIENT_URL is not set', async () => {
      delete process.env.CLIENT_URL;
      jest.resetModules();
      const { isOriginAllowed } = await import('../../config/cors.js');
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('https://random.com')).toBe(false);
    });
  });
});