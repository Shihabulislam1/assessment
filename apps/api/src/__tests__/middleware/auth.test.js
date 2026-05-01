import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

process.env.JWT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyrbyo2DCTmeXz\n5jqioXEovBILBL/1llH/XIDPDx5fnbncInFfGwVMIo/sTo5arSLx9O5QStH6mQPn\n7iP/2GLXgi3iTByKqVEuqcTjD0iIMvFqeBLCTSLrfatJJ7HyZI7FZg2aF9Czq7m0\n73/MIEUj4HMCRpgFbir8H65b3xbAfSv4Qj9iaI+Yk6p4FwPRdT9mP79pabQnDBse\n4NvH6rHexS5OofdDS4wIZ9k7/cn40SB9yZ2stBUsvDtrtH+M8EhjnZav5Y4ad999\nox2kZiL4cKbA4K8gH33kJ2tibQ0T0kE7S8PBlA5DG9EtRmw7jUAPOatRJqrsBjze\nC6932fIjAgMBAAECggEAJQx7QvNY1zIhCTqiy9f3079zak940h5yMCXpG4YCAUd+\nI1QM9/BtX8UG3LPJNqoRxePIimOJOJIDylKJqmIe1JrMktC/Vk0XZTqUdZRUsNEH\nV9E/6oP+CqBLJOcTMbSCGhI4Hcx0XNztq8PBVv0V+QNwNXeXzAB070RObgRK/mxc\n/qN5at9Dounr/Wif0WvJ4ntclcftrkpLBzpNNEdmmSQVWZ+MdaO6I4fwYlofjwvt\nqJ9M1xMrj9idVdORQ90HsFBi0JNhPEXvVQ3MA0Y8rwR0z2p7elrESv67Yyd4R1Ag\nFEURdTa+c5YnFz22WyHkUNljQHcxoT2aNSDzE3i7GQKBgQDm3HvXZI5Z7+8Mf/js\nZrAcetl8dla7vxv5nA5cVSC15atezB9kj4kR9yb6ImPOGz3wjSPIa9G+M6l5bs4U\nSE6xdXNJwPg2RGdpKcT5xkb3uV5FDXfzTTMvrJ1GMN32sOJQFVMuJTzsPMAjhJVK\ndmtdrGNnlCZSDyFbLbWR0fi9FQKBgQDGIprLHVtW+y8aR65RGbusb/toInGlMOkU\nRsIP8xt22R5cPazTrG2JeP89IzzFdLpgoLwJA+v0UGM7yoIZ0eqZJZZlGqrFPUwr\ncZfGq8LSdFhe8+hUpaYeckJ04jtI0mrgWwSqSlTXRDHEp1bYZV7IF5AWmnYk5bme\njXGsTlbwVwKBgAgYTxdcZUluClnL2vSfHSnCfQHKPHxU1SxJdo9yRLVcGkg2rBsg\nlVPV8L3wmsNNXTykFk8eyLn8ocKqSfuYFXpPff1mEM4GVAHx/wArHa3uCAov0Lbt\nTBAt403kxMOzrBvWw5XopFw8PRiBu6JiyJz+QHYPUdCqyyahUa6NSEWJAoGARWPJ\nImldm9DMZj/EZNLGT1XIjmfBtUCz4E4HmN5jN/RCFbvj0x4IHqUpfpfgqKaAv2aL\nc/zTnfSpTD9X4QMLTidDzJTSSdF146Ecro9o45urd1WkgECjNPZ/H8A7Uv2eQISf\n1aPCosFXTK/uUkruLtVRuRjPV4y8vTJ8JQQqnnECgYEAqVLkYKeqdK49/BMTHl/z\nrBUM/oub0DQLQ4ppfV/lQHTSfS6QquFOqxn1HlF2INwHSx+IbJECGGPFhcrVJ6PO\nUqVDbuZMo/I12qRilvL1tHcKLlKMzgajXst2QodZs3LLo76qjBE8qrGQs+vp8IYH\n8M6ec7EREmR3RULKlMmS4yk=\n-----END PRIVATE KEY-----';
process.env.JWT_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsq28qNgwk5nl8+Y6oqFx\nKLwSCwS/9ZZR/1yAzw8eX5253CJxXxsFTCKP7E6OWq0i8fTuUErR+pkD5+4j/9hi\n14It4kwciqlRLqnE4w9IiDLxangSwk0i632rSSex8mSOxWYNmhfQs6u5tO9/zCBF\nI+BzAkaYBW4q/B+uW98WwH0r+EI/YmiPmJOqeBcD0XU/Zj+/aWm0JwwbHuDbx+qx\n3sUuTqH3Q0uMCGfZO/3J+NEgfcmdrLQVLLw7a7R/jPBIY52Wr+WOGnfffaMdpGYi\n+HCmwOCvIB995CdrYm0NE9JBO0vDwZQOQxvRLUZsO41ADzmrUSaq7AY83guvd9ny\nIwIDAQAB\n-----END PUBLIC KEY-----';
process.env.JWT_ISSUER = 'fredocloud';
process.env.JWT_AUDIENCE = 'fredocloud-api';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

describe('Auth Middleware', () => {
  let requireAuth;
  beforeEach(async () => {
    jest.resetModules();
    const mod = await import('../../middleware/auth.js');
    requireAuth = mod.requireAuth;
  });

  const mockReq = (token) => ({ cookies: { access_token: token } });
  const mockRes = () => ({});
  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
  });

  it('throws No access token when cookie is missing', () => {
    const req = { cookies: {} };
    expect(() => requireAuth(req, mockRes(), mockNext)).toThrow('No access token');
  });

  it('decodes valid token and sets req.user', () => {
    const user = { id: 'user123', email: 'test@example.com' };
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_PRIVATE_KEY,
      { algorithm: 'RS256', expiresIn: '15m', issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );
    const req = mockReq(token);
    requireAuth(req, mockRes(), mockNext);
    expect(req.user).toEqual({ id: 'user123', email: 'test@example.com' });
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('throws Invalid or expired token for wrong issuer', () => {
    const token = jwt.sign(
      { sub: 'user123', email: 'test@example.com' },
      JWT_PRIVATE_KEY,
      { algorithm: 'RS256', expiresIn: '15m', issuer: 'wrong-issuer', audience: JWT_AUDIENCE }
    );
    const req = mockReq(token);
    expect(() => requireAuth(req, mockRes(), mockNext)).toThrow('Invalid or expired token');
  });

  it('throws Invalid or expired token for wrong audience', () => {
    const token = jwt.sign(
      { sub: 'user123', email: 'test@example.com' },
      JWT_PRIVATE_KEY,
      { algorithm: 'RS256', expiresIn: '15m', issuer: JWT_ISSUER, audience: 'wrong-audience' }
    );
    const req = mockReq(token);
    expect(() => requireAuth(req, mockRes(), mockNext)).toThrow('Invalid or expired token');
  });

  it('throws Invalid or expired token for expired token', () => {
    const token = jwt.sign(
      { sub: 'user123', email: 'test@example.com' },
      JWT_PRIVATE_KEY,
      { algorithm: 'RS256', expiresIn: '-1s', issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
    );
    const req = mockReq(token);
    expect(() => requireAuth(req, mockRes(), mockNext)).toThrow('Invalid or expired token');
  });

  it('throws Invalid or expired token for malformed token', () => {
    const req = mockReq('not.a.valid.jwt');
    expect(() => requireAuth(req, mockRes(), mockNext)).toThrow('Invalid or expired token');
  });
});