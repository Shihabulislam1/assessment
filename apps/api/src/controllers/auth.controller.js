import * as authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { setCsrfCookie, clearCsrfCookie } from '../middleware/csrf.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const COOKIE_SAME_SITE = IS_PRODUCTION ? 'none' : 'lax';

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: COOKIE_SAME_SITE,
  maxAge: 15 * 60 * 1000,
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: COOKIE_SAME_SITE,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth/refresh',
};

const clearCookies = (res) => {
  res.clearCookie('access_token', { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('refresh_token', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
  setCsrfCookie(res, result.csrfToken);
  res.status(201).json({ user: result.user });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
  setCsrfCookie(res, result.csrfToken);
  res.status(200).json({ user: result.user });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  try {
    const result = await authService.refresh(refreshToken);
    res.cookie('access_token', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    setCsrfCookie(res, result.csrfToken);
    res.status(200).json({ user: result.user });
  } catch (err) {
    if (err.statusCode === 401 || err.statusCode === 403) {
      clearCookies(res);
      clearCsrfCookie(res);
    }
    throw err;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  clearCookies(res);
  clearCsrfCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);
  res.status(200).json(result);
});