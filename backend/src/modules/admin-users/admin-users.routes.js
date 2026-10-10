import { Router } from 'express';

import { asyncHandler } from '../../utils/async-handler.js';
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser
} from './admin-users.service.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const admins = await listAdminUsers();
    res.json({ items: admins });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const admin = await createAdminUser(req.body);
    res.status(201).json({ item: admin });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const admin = await updateAdminUser(Number(req.params.id), req.body, req.user.id);
    res.json({ item: admin });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteAdminUser(Number(req.params.id), req.user.id);
    res.status(204).send();
  })
);

export default router;
