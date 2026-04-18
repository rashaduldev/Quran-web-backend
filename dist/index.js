"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_1 = require("./swagger/swagger.config");
const surah_route_1 = __importDefault(require("./routes/surah.route"));
const search_route_1 = __importDefault(require("./routes/search.route"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const quran_service_1 = require("./services/quran.service");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please try again later.' },
});
const searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, error: 'Too many search requests. Please slow down.' },
});
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined', {
    stream: { write: (message) => logger_1.logger.http(message.trim()) },
}));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #1a3a2a, #2d6a4f); }
      .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml,...'); }
      .swagger-ui .info .title { color: #2d6a4f; }
      .swagger-ui .btn.execute { background: #2d6a4f; }
      .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2d6a4f; }
    `,
    customSiteTitle: 'Quran API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    },
}));
app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_config_1.swaggerSpec);
});
app.use('/api/surahs', apiLimiter, surah_route_1.default);
app.use('/api/search', apiLimiter, searchLimiter, search_route_1.default);
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});
app.get('/api/cache/stats', (_req, res) => {
    res.json({ success: true, data: (0, quran_service_1.getCacheStats)() });
});
app.delete('/api/cache/clear', (_req, res) => {
    (0, quran_service_1.clearCache)();
    res.json({ success: true, message: 'Cache cleared successfully' });
});
app.get('/', (_req, res) => {
    res.redirect('/api-docs');
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.globalErrorHandler);
const server = app.listen(PORT, () => {
    logger_1.logger.info(`Quran API running on http://localhost:${PORT}`);
    logger_1.logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
    logger_1.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM signal received. Shutting down gracefully...');
    server.close(() => {
        logger_1.logger.info('HTTP server closed.');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT signal received. Shutting down gracefully...');
    server.close(() => {
        logger_1.logger.info('HTTP server closed.');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map