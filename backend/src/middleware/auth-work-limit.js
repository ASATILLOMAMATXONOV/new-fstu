// Bound expensive bcrypt work instead of keeping an unbounded request queue.
let active = 0;
export function authWorkLimit(_req, res, next) {
  if (active >= 4) {
    res.set('Retry-After', '3');
    return res.status(503).json({ message: 'Kirish xizmati band. Birozdan keyin qayta urinib ko‘ring.' });
  }
  active += 1;
  let released = false;
  const release = () => { if (!released) { released = true; active -= 1; } };
  res.once('finish', release);
  res.once('close', release);
  next();
}
