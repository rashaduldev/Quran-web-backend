"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const isProduction = process.env.NODE_ENV === 'production';
const baseFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
}));
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: baseFormat,
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), baseFormat)
        }),
    ],
});
if (!isProduction) {
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.uncolorize(), baseFormat),
    }));
    exports.logger.add(new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: winston_1.default.format.combine(winston_1.default.format.uncolorize(), baseFormat),
    }));
}
exports.httpLogger = winston_1.default.createLogger({
    level: 'http',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [new winston_1.default.transports.Console()],
});
//# sourceMappingURL=logger.js.map