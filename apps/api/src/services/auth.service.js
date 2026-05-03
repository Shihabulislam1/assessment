import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Unauthorized, Conflict } from '../utils/AppError.js';
import prisma from '../config/db.js';

export const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

const getRequiredMultilineEnv = (name) => {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.replace(/\\n/g, '\n');
};

const JWT_PRIVATE_KEY = getRequiredMultilineEnv('JWT_PRIVATE_KEY');
const JWT_PUBLIC_KEY = getRequiredMultilineEnv('JWT_PUBLIC_KEY');
const JWT_ISSUER = process.env.JWT_ISSUER || 'fredocloud';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'fredocloud-api';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user.id, email: user.email },
    JWT_PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '15m', issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
  );
};

export const generateRefreshToken = (user) => {
  const token = jwt.sign(
    { sub: user.id },
    JWT_PRIVATE_KEY,
    { algorithm: 'RS256', expiresIn: '7d', issuer: JWT_ISSUER, audience: JWT_AUDIENCE }
  );
  return { token };
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const register = async ({ email, password, name }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new Conflict('Email already registered');

  const hashedPassword = await hashPassword(password);
  let user;
  try {
    user = await prisma.user.create({
      data: { email: normalizedEmail, password: hashedPassword, name },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new Conflict('Email already registered');
    }
    throw err;
  }

  const accessToken = generateAccessToken(user);
  const { token: refreshToken } = generateRefreshToken(user);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  const csrfToken = generateCsrfToken();

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
    csrfToken,
  };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) throw new Unauthorized('Invalid credentials');

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Unauthorized('Invalid credentials');

  const accessToken = generateAccessToken(user);
  const { token: refreshToken } = generateRefreshToken(user);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  const csrfToken = generateCsrfToken();

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
    csrfToken,
  };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) throw new Unauthorized('No refresh token');

  const tokenHash = hashToken(refreshToken);
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new Unauthorized('Invalid refresh token');
  }

  if (tokenRecord.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    throw new Unauthorized('Refresh token expired');
  }

  if (tokenRecord.isUsed) {
    await prisma.refreshToken.deleteMany({ where: { userId: tokenRecord.userId } });
    throw new Unauthorized('Token reuse detected');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  } catch {
    await prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => {});
    throw new Unauthorized('Invalid or expired token');
  }

  if (decoded.sub !== tokenRecord.userId) {
    await prisma.refreshToken.deleteMany({ where: { userId: tokenRecord.userId } }).catch(() => {});
    throw new Unauthorized('Invalid refresh token');
  }

  const user = tokenRecord.user;
  const newAccessToken = generateAccessToken(user);
  const { token: newRefreshToken } = generateRefreshToken(user);
  const newTokenHash = hashToken(newRefreshToken);

  await prisma.$transaction(async (tx) => {
    const result = await tx.refreshToken.updateMany({
      where: { id: tokenRecord.id, isUsed: false },
      data: { isUsed: true },
    });

    if (result.count !== 1) {
      await tx.refreshToken.deleteMany({ where: { userId: tokenRecord.userId } });
      throw new Unauthorized('Token reuse detected');
    }

    await tx.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    csrfToken: generateCsrfToken(),
  };
};

export const logout = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
  return { message: 'Logged out successfully' };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  });
  if (!user) throw new Unauthorized('User not found');
  return { user };
};