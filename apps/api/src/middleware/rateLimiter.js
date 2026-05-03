import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT) || 5,
  skipSuccessfulRequests: true,
  message: { error: { message: 'Too many authentication attempts, try again later' } },
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.REFRESH_RATE_LIMIT) || 10,
  message: { error: { message: 'Too many refresh attempts, try again later' } },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: { error: { message: 'Too many requests, slow down' } },
});

export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.INVITE_RATE_LIMIT) || 20,
  message: { error: { message: 'Too many invite attempts, try again later' } },
});