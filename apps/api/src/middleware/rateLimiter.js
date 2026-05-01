import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: { message: 'Too many authentication attempts, try again later' } },
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: { message: 'Too many refresh attempts, try again later' } },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: { message: 'Too many requests, slow down' } },
});