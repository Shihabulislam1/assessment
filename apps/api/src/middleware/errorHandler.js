import { AppError } from '../utils/AppError.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err instanceof AppError || !!err.statusCode || !!err.status;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isOperational || isDevelopment
    ? err.message || 'Internal Server Error'
    : 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(isDevelopment && { stack: err.stack }),
  });
};