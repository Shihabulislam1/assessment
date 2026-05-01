import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(res, req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(res, req.body);
  res.status(200).json(result);
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  const result = await authService.refresh(res, refreshToken);
  res.status(200).json(result);
});

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(res, req.user.id);
  res.status(200).json(result);
});

export const me = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);
  res.status(200).json(result);
});