import jwt from 'jsonwebtoken';
import { Unauthorized } from '../utils/AppError.js';

const getJwtPublicKey = () => {
  const key = process.env.JWT_PUBLIC_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    throw new Error('Missing or invalid JWT_PUBLIC_KEY environment variable');
  }
  return key.replace(/\\n/g, '\n');
};

const JWT_PUBLIC_KEY = getJwtPublicKey();

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