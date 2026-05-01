class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFound extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class Validation extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

class Unauthorized extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class Forbidden extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class Conflict extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export { AppError, NotFound, Validation, Unauthorized, Forbidden, Conflict };
