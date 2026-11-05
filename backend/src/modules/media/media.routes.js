import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Router } from 'express';

import { authenticate } from '../../middleware/authenticate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { HttpError } from '../../utils/http-error.js';
import { sendOptimizedImage } from '../../utils/image-optimizer.js';

const router = Router();
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const imageDirectory = path.resolve(moduleDirectory, '../../../uploads/editor-images');
const imageTypes = new Map([
  ['png', 'image/png'],
  ['jpg', 'image/jpeg'],
  ['jpeg', 'image/jpeg'],
  ['webp', 'image/webp'],
  ['gif', 'image/gif']
]);

function parseImage(dataUrl = '') {
  const match = String(dataUrl).match(/^data:image\/(png|jpe?g|webp|gif);base64,([a-z0-9+/=\s]+)$/i);

  if (!match) {
    throw new HttpError(400, 'Rasm formati noto‘g‘ri.');
  }

  const extension = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
  const body = Buffer.from(match[2].replace(/\s/g, ''), 'base64');

  if (!body.length || body.length > 8 * 1024 * 1024) {
    throw new HttpError(400, 'Rasm hajmi noto‘g‘ri.');
  }

  return { body, extension };
}

router.post(
  '/images',
  authenticate,
  asyncHandler(async (req, res) => {
    const { body, extension } = parseImage(req.body?.dataUrl);
    const fileName = `${randomUUID()}.${extension}`;

    await mkdir(imageDirectory, { recursive: true });
    await writeFile(path.join(imageDirectory, fileName), body, { flag: 'wx' });

    const forwardedProtocol = String(req.get('x-forwarded-proto') || '').split(',')[0].trim();
    const protocol = forwardedProtocol || req.protocol;
    const origin = `${protocol}://${req.get('host')}`;

    res.status(201).json({ url: `${origin}/api/media/images/${fileName}` });
  })
);

router.get(
  '/images/:fileName',
  asyncHandler(async (req, res) => {
    const fileName = String(req.params.fileName || '');
    const match = fileName.match(/^[a-f0-9-]+\.(png|jpe?g|webp|gif)$/i);

    if (!match) {
      throw new HttpError(404, 'Rasm topilmadi.');
    }

    try {
      const body = await readFile(path.join(imageDirectory, fileName));
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      await sendOptimizedImage(req, res, {
        buffer: body,
        mimeType: imageTypes.get(match[1].toLowerCase()) || 'application/octet-stream',
        cacheKey: `media:${fileName}`
      });
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new HttpError(404, 'Rasm topilmadi.');
      }
      throw error;
    }
  })
);

export default router;
