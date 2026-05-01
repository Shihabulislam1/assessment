import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Unauthorized } from '../utils/AppError.js';
import prisma from '../config/db.js';

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000,
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth/refresh',
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (user) => {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (user) => {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign({ sub: user.id, jti }, JWT_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '7d',
  });
  return { token, jti };
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('access_token', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearCookies = (res) => {
  res.clearCookie('access_token', { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('refresh_token', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
};

export const register = async (res, { email, password, name }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Unauthorized('Email already registered');

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const accessToken = generateAccessToken(user);
  const { token: refreshToken, jti } = generateRefreshToken(user);
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  setCookies(res, accessToken, refreshToken);
  return { user: { id: user.id, email: user.email, name: user.name } };
};

export const login = async (res, { email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Unauthorized('Invalid credentials');

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Unauthorized('Invalid credentials');

  const accessToken = generateAccessToken(user);
  const { token: refreshToken, jti } = generateRefreshToken(user);
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  setCookies(res, accessToken, refreshToken);
  return { user: { id: user.id, email: user.email, name: user.name } };
};

export const refresh = async (res, refreshToken) => {
  if (!refreshToken) throw new Unauthorized('No refresh token');

  const tokenHash = hashToken(refreshToken);
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.isUsed) {
    if (tokenRecord?.userId) {
      await prisma.refreshToken.deleteMany({ where: { userId: tokenRecord.userId } });
    }
    throw new Unauthorized('Token reuse detected');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_PUBLIC_KEY, { algorithms: ['RS256'] });
  } catch {
    throw new Unauthorized('Invalid or expired token');
  }

  const user = tokenRecord.user;
  const newAccessToken = generateAccessToken(user);
  const { token: newRefreshToken } = generateRefreshToken(user);
  const newTokenHash = hashToken(newRefreshToken);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isUsed: true },
    }),
    prisma.refreshToken.create({
      data: { tokenHash: newTokenHash, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  setCookies(res, newAccessToken, newRefreshToken);
  return { user: { id: user.id, email: user.email, name: user.name } };
};

export const logout = async (res, userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
  clearCookies(res);
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