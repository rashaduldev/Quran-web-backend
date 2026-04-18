import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error caught by global handler:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.issues,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Axios errors from upstream API
  if (err.name === 'AxiosError') {
    return res.status(502).json({
      success: false,
      error: 'Failed to fetch data from Quran API. Please try again.',
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}
