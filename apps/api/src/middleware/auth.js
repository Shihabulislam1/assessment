import jwt from 'jsonwebtoken';
import { Unauthorized } from '../utils/AppError.js';

const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n');

export const requireAuth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) throw new Unauthorized('No access token');

  try {
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
    });
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch {
    throw new Unauthorized('Invalid or expired token');
  }
};