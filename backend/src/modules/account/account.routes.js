import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import {
  clearLoginFailures,
  loginRateLimit,
  registerLoginFailure
} from '../../middleware/login-rate-limit.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getCurrentAdmin, loginAdmin, registerAdmin } from './account.service.js';

const router = Router();

router.post(
  '/login',
  loginRateLimit,
  asyncHandler(async (req, res) => {
    try {
      const result = await loginAdmin(req.body, {
        ipAddress: req.ip
      });

      clearLoginFailures(req);
      res.json(result);
    } catch (error) {
      if (error?.statusCode === 401 || error?.statusCode === 423) {
        registerLoginFailure(req);
      }
      throw error;
    }
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await getCurrentAdmin(req.user.id);
    res.json({ user });
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const result = await registerAdmin(req.body);
    res.status(201).json(result);
  })
);

export default router;
