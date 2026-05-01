import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

process.env.JWT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCyrbyo2DCTmeXz\n5jqioXEovBILBL/1llH/XIDPDx5fnbncInFfGwVMIo/sTo5arSLx9O5QStH6mQPn\n7iP/2GLXgi3iTByKqVEuqcTjD0iIMvFqeBLCTSLrfatJJ7HyZI7FZg2aF9Czq7m0\n73/MIEUj4HMCRpgFbir8H65b3xbAfSv4Qj9iaI+Yk6p4FwPRdT9mP79pabQnDBse\n4NvH6rHexS5OofdDS4wIZ9k7/cn40SB9yZ2stBUsvDtrtH+M8EhjnZav5Y4ad999\nox2kZiL4cKbA4K8gH33kJ2tibQ0T0kE7S8PBlA5DG9EtRmw7jUAPOatRJqrsBjze\nC6932fIjAgMBAAECggEAJQx7QvNY1zIhCTqiy9f3079zak940h5yMCXpG4YCAUd+\nI1QM9/BtX8UG3LPJNqoRxePIimOJOJIDylKJqmIe1JrMktC/Vk0XZTqUdZRUsNEH\nV9E/6oP+CqBLJOcTMbSCGhI4Hcx0XNztq8PBVv0V+QNwNXeXzAB070RObgRK/mxc\n/qN5at9Dounr/Wif0WvJ4ntclcftrkpLBzpNNEdmmSQVWZ+MdaO6I4fwYlofjwvt\nqJ9M1xMrj9idVdORQ90HsFBi0JNhPEXvVQ3MA0Y8rwR0z2p7elrESv67Yyd4R1Ag\nFEURdTa+c5YnFz22WyHkUNljQHcxoT2aNSDzE3i7GQKBgQDm3HvXZI5Z7+8Mf/js\nZrAcetl8dla7vxv5nA5cVSC15atezB9kj4kR9yb6ImPOGz3wjSPIa9G+M6l5bs4U\nSE6xdXNJwPg2RGdpKcT5xkb3uV5FDXfzTTMvrJ1GMN32sOJQFVMuJTzsPMAjhJVK\ndmtdrGNnlCZSDyFbLbWR0fi9FQKBgQDGIprLHVtW+y8aR65RGbusb/toInGlMOkU\nRsIP8xt22R5cPazTrG2JeP89IzzFdLpgoLwJA+v0UGM7yoIZ0eqZJZZlGqrFPUwr\ncZfGq8LSdFhe8+hUpaYeckJ04jtI0mrgWwSqSlTXRDHEp1bYZV7IF5AWmnYk5bme\njXGsTlbwVwKBgAgYTxdcZUluClnL2vSfHSnCfQHKPHxU1SxJdo9yRLVcGkg2rBsg\nlVPV8L3wmsNNXTykFk8eyLn8ocKqSfuYFXpPff1mEM4GVAHx/wArHa3uCAov0Lbt\nTBAt403kxMOzrBvWw5XopFw8PRiBu6JiyJz+QHYPUdCqyyahUa6NSEWJAoGARWPJ\nImldm9DMZj/EZNLGT1XIjmfBtUCz4E4HmN5jN/RCFbvj0x4IHqUpfpfgqKaAv2aL\nc/zTnfSpTD9X4QMLTidDzJTSSdF146Ecro9o45urd1WkgECjNPZ/H8A7Uv2eQISf\n1aPCosFXTK/uUkruLtVRuRjPV4y8vTJ8JQQqnnECgYEAqVLkYKeqdK49/BMTHl/z\nrBUM/oub0DQLQ4ppfV/lQHTSfS6QquFOqxn1HlF2INwHSx+IbJECGGPFhcrVJ6PO\nUqVDbuZMo/I12qRilvL1tHcKLlKMzgajXst2QodZs3LLo76qjBE8qrGQs+vp8IYH\n8M6ec7EREmR3RULKlMmS4yk=\n-----END PRIVATE KEY-----';
process.env.JWT_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsq28qNgwk5nl8+Y6oqFx\nKLwSCwS/9ZZR/1yAzw8eX5253CJxXxsFTCKP7E6OWq0i8fTuUErR+pkD5+4j/9hi\n14It4kwciqlRLqnE4w9IiDLxangSwk0i632rSSex8mSOxWYNmhfQs6u5tO9/zCBF\nI+BzAkaYBW4q/B+uW98WwH0r+EI/YmiPmJOqeBcD0XU/Zj+/aWm0JwwbHuDbx+qx\n3sUuTqH3Q0uMCGfZO/3J+NEgfcmdrLQVLLw7a7R/jPBIY52Wr+WOGnfffaMdpGYi\n+HCmwOCvIB995CdrYm0NE9JBO0vDwZQOQxvRLUZsO41ADzmrUSaq7AY83guvd9ny\nIwIDAQAB\n-----END PUBLIC KEY-----';

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.unstable_mockModule('../../config/db.js', () => ({
  default: mockPrisma,
}));

const {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  register,
  login,
  refresh,
  logout,
  getMe,
} = await import('../../services/auth.service.js');

describe('Auth Service', () => {
  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('creates bcrypt hash with 12 rounds', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      const rounds = parseInt(bcrypt.getRounds(hash));
      expect(rounds).toBe(12);
    });

    it('generates different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('returns false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);
      const result = await verifyPassword('WrongPassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('creates RS256 JWT with 15min expiry', () => {
      const user = { id: 'user123', email: 'test@example.com' };
      const token = generateAccessToken(user);
      const decoded = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
      expect(decoded.sub).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      const exp = decoded.exp - decoded.iat;
      expect(exp).toBe(15 * 60);
    });
  });

  describe('generateRefreshToken', () => {
    it('creates RS256 JWT with jti claim', () => {
      const user = { id: 'user123', email: 'test@example.com' };
      const { token, jti } = generateRefreshToken(user);
      expect(jti).toBeDefined();
      expect(jti.length).toBe(32);
      const decoded = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
      expect(decoded.jti).toBe(jti);
      expect(decoded.sub).toBe(user.id);
    });
  });

  describe('hashToken', () => {
    it('returns SHA-256 hash of token', () => {
      const token = 'test-token';
      const hash = hashToken(token);
      expect(hash).toBe(crypto.createHash('sha256').update(token).digest('hex'));
    });
  });

  describe('register', () => {
    it('creates user with hashed password', async () => {
      const userData = { email: 'new@example.com', password: 'Password123!', name: 'New User' };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user123', ...userData, password: 'hashed' });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await register(mockRes, userData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(result.user.email).toBe(userData.email);
    });

    it('throws error if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'existing@example.com' });
      await expect(register(mockRes, { email: 'existing@example.com', password: 'Pass123!', name: 'Test' }))
        .rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('returns user on valid credentials', async () => {
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = { id: 'user123', email: 'test@example.com', name: 'Test User', password: hashedPassword };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await login(mockRes, { email: 'test@example.com', password });

      expect(result.user.email).toBe(user.email);
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
    });

    it('throws error on invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(login(mockRes, { email: 'wrong@example.com', password: 'Pass' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('throws error on invalid password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 12);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user123', email: 'test@example.com', password: hashedPassword });

      await expect(login(mockRes, { email: 'test@example.com', password: 'WrongPassword' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('rotates tokens correctly', async () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test User' };
      const oldToken = jwt.sign({ sub: user.id, jti: 'old-jti' }, JWT_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' });
      const oldHash = hashToken(oldToken);
      const tokenRecord = { id: 'token123', tokenHash: oldHash, userId: user.id, isUsed: false, user };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(tokenRecord);
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const result = await refresh(mockRes, oldToken);

      expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({ where: { tokenHash: oldHash }, include: { user: true } });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(result.user.id).toBe(user.id);
    });

    it('detects token reuse and revokes all user tokens', async () => {
      const user = { id: 'user123', email: 'test@example.com' };
      const usedToken = jwt.sign({ sub: user.id, jti: 'used-jti' }, JWT_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: '7d' });
      const usedHash = hashToken(usedToken);
      const tokenRecord = { id: 'token123', tokenHash: usedHash, userId: user.id, isUsed: true, user };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(tokenRecord);
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      await expect(refresh(mockRes, usedToken)).rejects.toThrow('Token reuse detected');
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: user.id } });
    });

    it('throws error for invalid token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(refresh(mockRes, 'invalid-token')).rejects.toThrow('Token reuse detected');
    });
  });

  describe('logout', () => {
    it('invalidates all user refresh tokens', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      const result = await logout(mockRes, 'user123');

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user123' } });
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('getMe', () => {
    it('returns user without password', async () => {
      const user = { id: 'user123', email: 'test@example.com', name: 'Test User', avatarUrl: null, createdAt: new Date() };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await getMe('user123');

      expect(result.user.password).toBeUndefined();
      expect(result.user.email).toBe(user.email);
    });

    it('throws error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(getMe('nonexistent')).rejects.toThrow('User not found');
    });
  });
});