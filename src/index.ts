import express , {Express} from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger.config';
import surahRoutes from './routes/surah.route';
import searchRoutes from './routes/search.route';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { getCacheStats, clearCache } from './services/quran.service';

const app:Express = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(cors({
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
  } else {
    next();
  }
});


// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many search requests. Please slow down.' },
});

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// Swagger UI Setup 
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
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
  })
);

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes 
app.use('/api/surahs', apiLimiter, surahRoutes);
app.use('/api/search', apiLimiter, searchLimiter, searchRoutes);

// Health & Status Routes

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 */
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Cache stats
 */
app.get('/api/cache/stats', (_req, res) => {
  res.json({ success: true, data: getCacheStats() });
});

/**
 * @swagger
 * /api/cache/clear:
 *   delete:
 *     summary: Clear all cached data
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Cache cleared
 */
app.delete('/api/cache/clear', (_req, res) => {
  clearCache();
  res.json({ success: true, message: 'Cache cleared successfully' });
});

// Root redirect to docs
app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

// Error Handling 
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`Quran API running on http://localhost:${PORT}`);
  logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

export default app;
