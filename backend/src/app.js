import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { authenticate, authorizeRoles, optionalAuth } from './middleware/authenticate.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import accountRoutes from './modules/account/account.routes.js';
import adminUserRoutes from './modules/admin-users/admin-users.routes.js';
import contentRoutes from './modules/content/content.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';

function isLocalDevOrigin(origin) {
  if (!origin) {
    return true;
  }

  try {
    const url = new URL(origin);
    return ['localhost', '127.0.0.1'].includes(url.hostname);
  } catch (_error) {
    return false;
  }
}

function normalizeOrigin(origin) {
  return String(origin || '')
    .trim()
    .replace(/\/$/, '');
}

function createCorsOptions() {
  if (env.corsOrigins.includes('*')) {
    return { origin: true };
  }

  return {
    origin(origin, callback) {
      const requestOrigin = normalizeOrigin(origin);

      if (
        !origin ||
        env.corsOrigins.includes(requestOrigin) ||
        (env.nodeEnv !== 'production' && isLocalDevOrigin(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    }
  };
}

export function createApp() {
  const app = express();

  app.set('etag', 'weak');
  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use('/api', (_req, res, next) => {
    const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(_req.method);
    const isSensitivePath =
      _req.path.startsWith('/account') || _req.path.startsWith('/admin-users');
    const isAuthenticatedRequest = Boolean(_req.headers.authorization);

    if (isMutating || isSensitivePath || isAuthenticatedRequest) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('Surrogate-Control', 'no-store');
    }

    next();
  });

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'fstu-backend',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/account', accountRoutes);
  app.use('/api/content', optionalAuth, contentRoutes);
  app.use('/api/settings', optionalAuth, settingsRoutes);
  app.use('/api/admin-users', authenticate, authorizeRoles('super_admin'), adminUserRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
