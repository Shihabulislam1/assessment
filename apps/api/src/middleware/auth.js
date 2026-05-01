import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/AppError.js';

export const requireAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) throw new UnauthorizedError('No access token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
    });
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};