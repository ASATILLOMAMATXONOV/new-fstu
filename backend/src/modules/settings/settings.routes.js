import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { authorizeSettingWrite } from '../../middleware/authorize-menu-access.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { deleteSetting, getSetting, upsertSetting } from './settings.service.js';

const router = Router();

function disablePublicCache(res) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.vary('Origin');
  res.vary('Authorization');
}

router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const item = await getSetting(req.params.key);
    if (!req.headers.authorization) {
      disablePublicCache(res);
    }
    res.json({ item });
  })
);

router.put(
  '/:key',
  authenticate,
  authorizeSettingWrite,
  asyncHandler(async (req, res) => {
    const item = await upsertSetting(req.params.key, req.body, req.user.id);
    res.json({ item });
  })
);

router.delete(
  '/:key',
  authenticate,
  authorizeSettingWrite,
  asyncHandler(async (req, res) => {
    await deleteSetting(req.params.key);
    res.status(204).send();
  })
);

export default router;
