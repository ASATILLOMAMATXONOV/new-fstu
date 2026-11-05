import compression from 'compression';
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
import assistantRoutes from './modules/assistant/assistant.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import { createSecurityMonitor } from './middleware/security-monitor.js';
import { createSecurityRouter } from './modules/security/security.routes.js';
import { HttpError } from './utils/http-error.js';
import { securityStore } from './modules/security/security.store.js';
import { safePath } from './modules/security/security-rules.js';
import { hasSessionCookie } from './modules/account/session.service.js';
import { authWorkLimit } from './middleware/auth-work-limit.js';

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

function isAllowedOrigin(origin) {
  return !origin || env.corsOrigins.includes('*') || env.corsOrigins.includes(normalizeOrigin(origin)) ||
    (env.nodeEnv !== 'production' && isLocalDevOrigin(origin));
}

function createCorsOptions() {
  if (env.corsOrigins.includes('*')) {
    return { origin: true, credentials: true, preflightContinue: true };
  }

  return {
    preflightContinue: true,
    credentials: true,
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    }
  };
}

export function createApp({ securityStorage = securityStore, securityMonitor = createSecurityMonitor(securityStorage) } = {}) {
  const app = express();

  app.set('etag', 'weak');
  app.disable('x-powered-by');
  if (env.trustedProxies.length) app.set('trust proxy', env.trustedProxies);
  app.locals.securityMonitor = securityMonitor;

  // Anti-fingerprinting: hide the server software and version from scanners such as
  // `nmap -sV`. We remove any Server banner and expose only a neutral, version-less name.
  app.use((_req, res, next) => {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.setHeader('Server', 'web');
    next();
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
  app.use(compression({ threshold: 1024 }));
  app.use(cors(createCorsOptions()));
  app.use(securityMonitor.middleware);
  app.use((req, _res, next) => next(isAllowedOrigin(req.get('origin')) ? undefined : new HttpError(403, 'Origin is not allowed by CORS.')));
  app.options('*', (_req, res) => res.sendStatus(204));
  app.use('/api/account/login', authWorkLimit);
  // Large CMS payloads require authentication before parsing base64 media.
  const smallJson = express.json({ limit: '256kb' });
  const cmsJson = express.json({ limit: '100mb' });
  app.use((req, res, next) => {
    const largeContentWrite = !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      /^\/api\/(?:content|settings|media)(?:\/|$)/i.test(req.path);
    if (!largeContentWrite) return smallJson(req, res, next);
    return authenticate(req, res, (error) => error ? next(error) : cmsJson(req, res, next));
  });
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  morgan.token('safe-path', safePath);
  app.use(morgan(':method :safe-path :status :response-time ms'));
  app.use('/api', (_req, res, next) => {
    const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(_req.method);
    const isSensitivePath =
      _req.path.startsWith('/account') || _req.path.startsWith('/admin-users') || _req.path.startsWith('/security');
    const isAuthenticatedRequest = Boolean(_req.headers.authorization) || hasSessionCookie(_req);

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
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/admin-users', authenticate, authorizeRoles('super_admin'), adminUserRoutes);
  app.use('/api/security', createSecurityRouter(securityStorage, securityMonitor.state));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
