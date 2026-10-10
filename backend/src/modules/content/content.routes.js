import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { authorizeContentWrite } from '../../middleware/authorize-menu-access.js';
import { asyncHandler } from '../../utils/async-handler.js';
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
    res.json({ items });
  })
);

router.get(
  '/:resource/tree',
  asyncHandler(async (req, res) => {
    const items = await listEntryTree(req.params.resource, req.query);
    if (!req.headers.authorization) {
      disablePublicCache(res);
    }
    res.json({ items });
  })
);

router.get(
  '/:resource/:id/image',
  asyncHandler(async (req, res) => {
    const image = await getEntryImage(req.params.resource, Number(req.params.id));

    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.vary('Origin');
    res.vary('Authorization');

    if (image.type === 'redirect') {
      res.redirect(image.location);
      return;
    }

    res.type(image.mimeType);
    res.send(image.body);
  })
);

router.get(
  '/:resource/:id',
  asyncHandler(async (req, res) => {
    const item = await getEntryById(req.params.resource, Number(req.params.id), req.query);
    if (!req.headers.authorization) {
      disablePublicCache(res);
    }
    res.json({ item });
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
