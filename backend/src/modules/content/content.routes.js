import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { authorizeContentWrite } from '../../middleware/authorize-menu-access.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { HttpError } from '../../utils/http-error.js';
import { sendOptimizedImage, setImageCacheHeaders } from '../../utils/image-optimizer.js';
import {
  buildAssetQuery,
  externalizeInlineAssets,
  getRequestOrigin,
  isPublicRequest,
  resolveInlineAsset
} from '../../utils/inline-assets.js';
import {
  createEntry,
  deleteEntry,
  getEntryImage,
  getEntryById,
  listEntryTree,
  listEntries,
  updateEntry
} from './content.service.js';
import { getPublicSiteRevision } from './public-site-revision.service.js';

const router = Router();

function disablePublicCache(res) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.vary('Origin');
  res.vary('Authorization');
}

// Public responses link to embedded base64 media instead of inlining it,
// which keeps JSON payloads small. Admin (authenticated) responses are untouched.
function externalizeEntry(req, entry) {
  if (!entry || typeof entry !== 'object' || entry.id === undefined || entry.id === null) {
    return entry;
  }

  const origin = getRequestOrigin(req);
  const version = new Date(entry.updatedAt || entry.createdAt || 0).getTime() || 0;
  const resource = encodeURIComponent(req.params.resource);
  const { children, ...rest } = entry;
  const result = externalizeInlineAssets(
    rest,
    (pathKey, index) =>
      `${origin}/api/content/${resource}/${entry.id}/asset?${buildAssetQuery(pathKey, index, version)}`
  );

  if (Array.isArray(children)) {
    result.children = children.map((child) => externalizeEntry(req, child));
  }

  return result;
}

function preparePublicEntries(req, items) {
  return isPublicRequest(req) ? items.map((item) => externalizeEntry(req, item)) : items;
}

router.get(
  '/__revision',
  asyncHandler(async (_req, res) => {
    disablePublicCache(res);
    res.json(await getPublicSiteRevision());
  })
);

router.get(
  '/:resource',
  asyncHandler(async (req, res) => {
    const items = await listEntries(req.params.resource, req.query);
    if (!req.headers.authorization) {
      disablePublicCache(res);
    }
    res.json({ items: preparePublicEntries(req, items) });
  })
);

router.get(
  '/:resource/tree',
  asyncHandler(async (req, res) => {
    const items = await listEntryTree(req.params.resource, req.query);
    if (!req.headers.authorization) {
      disablePublicCache(res);
    }
    res.json({ items: preparePublicEntries(req, items) });
  })
);

router.get(
  '/:resource/:id/image',
  asyncHandler(async (req, res) => {
    const image = await getEntryImage(req.params.resource, Number(req.params.id));

    setImageCacheHeaders(req, res);
    res.vary('Origin');
    res.vary('Authorization');

    if (image.type === 'redirect') {
      res.redirect(image.location);
      return;
    }

    await sendOptimizedImage(req, res, {
      buffer: image.body,
      mimeType: image.mimeType,
      cacheKey: `content:${req.params.resource}:${req.params.id}:${new Date(image.updatedAt || 0).getTime()}`
    });
  })
);

router.get(
  '/:resource/:id/asset',
  asyncHandler(async (req, res) => {
    const item = await getEntryById(req.params.resource, Number(req.params.id), { imageMode: 'separate' });
    const pathKey = String(req.query.path || '');
    const asset = resolveInlineAsset(item, pathKey, req.query.i);

    if (!asset) {
      throw new HttpError(404, 'Asset not found.');
    }

    setImageCacheHeaders(req, res);
    res.vary('Origin');

    await sendOptimizedImage(req, res, {
      buffer: asset.buffer,
      mimeType: asset.mimeType,
      cacheKey: `content-asset:${req.params.resource}:${req.params.id}:${new Date(item.updatedAt || 0).getTime()}:${pathKey}:${req.query.i ?? ''}`
    });
  })
);

router.get(
  '/:resource/:id',
  asyncHandler(async (req, res) => {
    const item = await getEntryById(req.params.resource, Number(req.params.id), req.query);
    if (!req.headers.authorization) {
      disablePublicCache(res);
    }
    res.json({ item: isPublicRequest(req) ? externalizeEntry(req, item) : item });
  })
);

router.post(
  '/:resource',
  authenticate,
  authorizeContentWrite,
  asyncHandler(async (req, res) => {
    const item = await createEntry(req.params.resource, req.body, req.user.id);
    res.status(201).json({ item });
  })
);

router.put(
  '/:resource/:id',
  authenticate,
  authorizeContentWrite,
  asyncHandler(async (req, res) => {
    const item = await updateEntry(
      req.params.resource,
      Number(req.params.id),
      req.body,
      req.user.id
    );
    res.json({ item });
  })
);

router.delete(
  '/:resource/:id',
  authenticate,
  authorizeContentWrite,
  asyncHandler(async (req, res) => {
    await deleteEntry(req.params.resource, Number(req.params.id));
    res.status(204).send();
  })
);

export default router;
