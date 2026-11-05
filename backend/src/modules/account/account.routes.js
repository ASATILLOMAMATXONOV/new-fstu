import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getCurrentAdmin, loginAdmin } from './account.service.js';
import { acknowledgeRecoveryCodes, changeLoginPassword, verifyLoginMfa } from './mfa.service.js';
import { clearSessionCookie, revokeSession, sendSession } from './session.service.js';
import { query } from '../../db/pool.js';

const router = Router();

function sendProgress(req, res, result) {
  if (result.session) {
    req.user = result.session.user;
    req.securityEvent = { type: 'login_success', severity: 'info', summary: 'Administrator ikki bosqichli tekshiruvdan o‘tib tizimga kirdi.' };
    return sendSession(res, result.session);
  }
  req.securityEvent = { type: 'login_step', severity: 'info', summary: 'Qo‘shimcha autentifikatsiya bosqichi talab qilindi.' };
  return res.json(result);
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const result = await loginAdmin(req.body, { request: req });
    sendProgress(req, res, result);
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await getCurrentAdmin(req.user.id);
    res.json({ user, csrfToken: req.authSession.csrfToken, expiresAt: req.authSession.expiresAt });
  })
);

for (const [path, action] of [['/login/password', changeLoginPassword], ['/login/verify', verifyLoginMfa], ['/login/confirm', acknowledgeRecoveryCodes]]) {
  router.post(path, asyncHandler(async (req, res) => sendProgress(req, res, await action(req.body, req))));
}

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  await revokeSession(req);
  clearSessionCookie(res);
  req.securityEvent = { type: 'logout', severity: 'info', summary: 'Administrator sessiyani tugatdi.' };
  res.status(204).send();
}));

router.post('/logout-all', authenticate, asyncHandler(async (req, res) => {
  await query('UPDATE admin_users SET token_version=token_version+1 WHERE id=$1', [req.user.id]);
  await query('UPDATE admin_sessions SET revoked_at=NOW() WHERE admin_id=$1 AND revoked_at IS NULL', [req.user.id]);
  clearSessionCookie(res);
  req.securityEvent = { type: 'logout', severity: 'info', summary: 'Administrator barcha sessiyalarni tugatdi.' };
  res.status(204).send();
}));

router.post('/register', (_req, res) => res.status(403).json({ message: 'Ommaviy admin ro‘yxatdan o‘tishi o‘chirilgan.' }));

export default router;
