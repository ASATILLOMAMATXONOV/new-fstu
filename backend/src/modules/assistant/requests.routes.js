import { Router } from 'express';
import { query } from '../../db/pool.js';
import { authenticate, authorizeRoles } from '../../middleware/authenticate.js';

const router = Router();
const field = (body, key) => typeof body?.[key] === 'string' ? body[key].trim() : '';

export function validateRequest(body) {
  const data = {
    type: field(body, 'type'), fullName: field(body, 'fullName'), phone: field(body, 'phone'),
    subject: field(body, 'subject'), message: field(body, 'message'),
    studentId: field(body, 'studentId'), group: field(body, 'group'), language: field(body, 'language') || 'uz'
  };
  if (!['appeal', 'hemis'].includes(data.type) ||
      data.fullName.length < 2 || data.fullName.length > 150 ||
      !/^[+0-9()\s-]{7,30}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7 ||
      data.subject.length < 3 || data.subject.length > 200 ||
      data.message.length < 10 || data.message.length > 5000 ||
      data.studentId.length > 50 || data.group.length > 80 ||
      !['uz', 'ru', 'en'].includes(data.language)) return null;
  return data;
}

router.post('/', async (req, res, next) => {
  const data = validateRequest(req.body);
  if (!data) return res.status(400).json({ error: 'invalid_request' });
  try {
    const result = await query(
      `INSERT INTO assistant_requests (type, full_name, phone, subject, message, student_id, student_group, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, created_at`,
      [data.type, data.fullName, data.phone, data.subject, data.message,
        data.type === 'hemis' ? data.studentId || null : null,
        data.type === 'hemis' ? data.group || null : null, data.language]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) { return next(error); }
});

router.get('/', authenticate, authorizeRoles('super_admin', 'admin'), async (req, res, next) => {
  try {
    const type = ['appeal', 'hemis'].includes(req.query.type) ? req.query.type : null;
    const result = await query(
      'SELECT * FROM assistant_requests WHERE ($1::text IS NULL OR type = $1) ORDER BY created_at DESC LIMIT 100', [type]
    );
    return res.json({ items: result.rows });
  } catch (error) { return next(error); }
});

export default router;
