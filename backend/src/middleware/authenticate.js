import { resolveSession } from '../modules/account/session.service.js';
import { HttpError } from '../utils/http-error.js';

export async function optionalAuth(req, _res, next) {
  try {
    req.user = (await resolveSession(req))?.user || null;
    next();
  } catch (error) { next(error); }
}

export async function authenticate(req, _res, next) {
  try {
    const session = await resolveSession(req);
    if (!session) return next(new HttpError(401, 'Authentication required.'));
    req.user = session.user;
    next();
  } catch (error) { next(error); }
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
