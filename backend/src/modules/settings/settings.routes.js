import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { authorizeSettingWrite } from '../../middleware/authorize-menu-access.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { HttpError } from '../../utils/http-error.js';
import { sendCachedOptimizedImage, sendOptimizedImage, setImageCacheHeaders } from '../../utils/image-optimizer.js';
import { sendPublicJson } from '../../utils/public-response-cache.js';
import {
  buildAssetQuery,
  externalizeInlineAssets,
  getRequestOrigin,
  isPublicRequest,
  resolveInlineAsset
} from '../../utils/inline-assets.js';
import { deleteSetting, getSetting, upsertSetting } from './settings.service.js';

const router = Router();

function disablePublicCache(res) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.vary('Origin');
  res.vary('Authorization');
}

// Replaces embedded base64 media with asset URLs for public visitors.
// `item` mirrors `data` at its top level, so both share the same paths.
function externalizeSetting(req, item) {
  if (!item) return item;

  const origin = getRequestOrigin(req);
  const version = new Date(item.updatedAt || 0).getTime() || 0;
  const key = encodeURIComponent(item.key);
  const data = externalizeInlineAssets(
    item.data,
    (pathKey, index) => `${origin}/api/settings/${key}/asset?${buildAssetQuery(pathKey, index, version)}`
  );

  return {
    key: item.key,
    data,
    ...data,
    updatedBy: item.updatedBy,
    updatedAt: item.updatedAt
  };
}

router.get(
  '/:key/asset',
  asyncHandler(async (req, res) => {
    const pathKey = String(req.query.path || '');
    // v = sozlamaning updatedAt vaqti; keshda bo'lsa bazadan o'qimaymiz.
    if (req.query.v) {
      setImageCacheHeaders(req, res);
      res.vary('Origin');
      const cacheKey = `setting:${req.params.key}:${req.query.v}:${pathKey}:${req.query.i ?? ''}`;
      if (sendCachedOptimizedImage(req, res, cacheKey)) return;
    }

    const item = await getSetting(req.params.key);
    const asset = item ? resolveInlineAsset(item.data, pathKey, req.query.i) : null;

    if (!asset) {
      throw new HttpError(404, 'Asset not found.');
    }

    setImageCacheHeaders(req, res);
    res.vary('Origin');

    await sendOptimizedImage(req, res, {
      buffer: asset.buffer,
      mimeType: asset.mimeType,
      cacheKey: `setting:${item.key}:${new Date(item.updatedAt || 0).getTime()}:${pathKey}:${req.query.i ?? ''}`
    });
  })
);

router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    if (!req.headers.authorization) {
      disablePublicCache(res);
    }
    await sendPublicJson(req, res, async () => {
      const item = await getSetting(req.params.key);
      return { item: isPublicRequest(req) ? externalizeSetting(req, item) : item };
    });
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
