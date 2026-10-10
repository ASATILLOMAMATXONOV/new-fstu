import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { getAdminById, serializeAdminUser } from '../modules/account/account.service.js';
import { HttpError } from '../utils/http-error.js';

function getTokenFromHeader(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

async function resolveUserFromRequest(req) {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: env.jwtIssuer,
      audience: env.jwtAudience
    });
    const user = await getAdminById(payload.sub);

    if (
      !user ||
      !user.active ||
      Number(payload.ver || 0) !== Number(user.token_version || 0)
    ) {
      return null;
    }

    return serializeAdminUser(user);
  } catch (_error) {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  req.user = await resolveUserFromRequest(req);
  next();
}

export async function authenticate(req, _res, next) {
  const user = await resolveUserFromRequest(req);

  if (!user) {
    next(new HttpError(401, 'Authentication required.'));
    return;
  }

  req.user = user;
  next();
}

export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Authentication required.'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'You do not have access to this action.'));
      return;
    }

    next();
  };
}
