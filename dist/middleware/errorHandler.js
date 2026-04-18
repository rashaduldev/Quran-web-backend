"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.notFoundHandler = notFoundHandler;
exports.globalErrorHandler = globalErrorHandler;
const logger_1 = require("./logger");
const zod_1 = require("zod");
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
    });
}
function globalErrorHandler(err, req, res, _next) {
    logger_1.logger.error('Error caught by global handler:', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method,
    });
    if (err instanceof zod_1.ZodError) {
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
//# sourceMappingURL=errorHandler.js.map