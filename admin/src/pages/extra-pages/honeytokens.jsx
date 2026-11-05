import { useState } from 'react';
import useSWR, { mutate as mutateCache } from 'swr';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ApiOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  ThunderboltFilled
} from '@ant-design/icons';

import IpDossierDialog from 'components/security/IpDossierDialog';
import { ClientInfo, IpCell, NetworkChip, number, relativeTime, time } from 'components/security/SecurityWidgets';
import useAuth from 'hooks/useAuth';
import { blockSecurityIp, createHoneytoken, deleteHoneytoken, securityFetcher, setHoneytokenActive, unblockSecurityIp } from 'api/security';

const swrOptions = { refreshInterval: 15000, revalidateOnFocus: true, shouldRetryOnError: false };
const typeLabels = { honeytoken: 'Tuzoq kalit ishlatildi' };

const dark = {
  bg: '#0a0f1e',
  panel: '#111a30',
  panelSoft: '#16213c',
  border: '#24314f',
  text: '#e6ecf7',
  sub: '#8aa0c6',
  accent: '#38bdf8',
  danger: '#f43f5e',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace'
};

function TokenValue({ token }) {
  const [shown, setShown] = useState(false);
  const masked = `${token.slice(0, 13)}${'•'.repeat(18)}${token.slice(-4)}`;
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Box component="code" sx={{ fontFamily: dark.mono, fontSize: 12, color: dark.accent, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
        {shown ? token : masked}
      </Box>
      <Tooltip title={shown ? 'Yashirish' : 'Ko‘rsatish'}>
        <IconButton size="small" onClick={() => setShown((v) => !v)} sx={{ color: dark.sub }}>
          {shown ? <EyeInvisibleOutlined style={{ fontSize: 13 }} /> : <EyeOutlined style={{ fontSize: 13 }} />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Nusxa olish">
        <IconButton size="small" onClick={() => navigator.clipboard?.writeText(token)} sx={{ color: dark.sub }}>
          <CopyOutlined style={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export default function HoneytokensPage() {
  const { user } = useAuth();
  const authorized = user?.role === 'super_admin';
  const [dossierIp, setDossierIp] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ label: '', placement: '' });
  const [created, setCreated] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const tokens = useSWR(authorized ? '/api/security/honeytokens' : null, securityFetcher, swrOptions);
  const triggers = useSWR(authorized ? '/api/security/honeytokens/triggers' : null, securityFetcher, swrOptions);
  const refresh = () => Promise.all([tokens.mutate(), triggers.mutate()]);

  async function submitCreate() {
    setBusy(true);
    setNotice(null);
    try {
      const response = await createHoneytoken(form);
      setCreated(response.item);
      setForm({ label: '', placement: '' });
      await tokens.mutate();
    } catch (error) {
      setNotice({ severity: 'error', message: error.message || 'Yaratib bo‘lmadi.' });
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item) {
    try {
      await setHoneytokenActive(item.id, !item.active);
      await tokens.mutate();
    } catch (error) {
      setNotice({ severity: 'error', message: error.message || 'O‘zgartirib bo‘lmadi.' });
    }
  }

  async function removeToken(id) {
    setBusy(true);
    try {
      await deleteHoneytoken(id);
      setConfirmDelete(null);
      await tokens.mutate();
    } catch (error) {
      setNotice({ severity: 'error', message: error.message || 'O‘chirib bo‘lmadi.' });
    } finally {
      setBusy(false);
    }
  }

  async function block(ip) {
    try {
      await blockSecurityIp({ ip, minutes: 1440, reason: 'Tuzoq kalit ishlatgani uchun qo‘lda bloklandi.' });
      await refresh();
      await mutateCache((key) => typeof key === 'string' && key.startsWith('/api/security/ip/'));
      setNotice({ severity: 'success', message: `${ip} bloklandi.` });
    } catch (error) {
      setNotice({ severity: 'error', message: error.message || 'Bloklab bo‘lmadi.' });
    }
  }

  async function unblock(ip) {
    try {
      await unblockSecurityIp(ip);
      await refresh();
      await mutateCache((key) => typeof key === 'string' && key.startsWith('/api/security/ip/'));
    } catch (error) {
      setNotice({ severity: 'error', message: error.message || 'Blok ochilmadi.' });
    }
  }

  if (!authorized) return <Alert severity="error">Bu bo‘lim faqat super admin uchun ochiq.</Alert>;

  const tokenList = tokens.data?.items || [];
  const triggerList = triggers.data?.items || [];
  const totalHits = tokenList.reduce((sum, item) => sum + Number(item.triggers || 0), 0);

  const panelSx = { bgcolor: dark.panel, border: `1px solid ${dark.border}`, borderRadius: 2, color: dark.text };
  const cellSx = { color: dark.text, borderColor: dark.border };
  const headSx = {
    color: dark.sub,
    borderColor: dark.border,
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5
  };

  return (
    <Box sx={{ bgcolor: dark.bg, m: { xs: -2, md: -3 }, p: { xs: 2, md: 3 }, minHeight: '100vh' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${dark.panel} 0%, #132a4d 60%, #16325f 100%)`,
            border: `1px solid ${dark.border}`
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.08,
              backgroundImage: 'radial-gradient(circle at 1px 1px, #7dd3fc 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}
          />
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} sx={{ position: 'relative' }}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ExperimentOutlined style={{ fontSize: 28, color: dark.accent }} />
                <Typography variant="h2" sx={{ color: dark.text }}>
                  Tuzoq kalitlar
                </Typography>
              </Stack>
              <Typography sx={{ mt: 1, color: dark.sub, maxWidth: 680 }}>
                Soxta API kalit — oddiy foydalanuvchi uni hech qachon ishlatmaydi. Kimdir yuborsa, 100% hujumchi: IP’si avtomatik bloklanadi
                va shu yerda to‘liq ma’lumoti bilan ko‘rinadi. Hech kimning kompyuteriga hech narsa yuborilmaydi.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Button
                variant="outlined"
                startIcon={<ReloadOutlined />}
                onClick={refresh}
                sx={{ color: dark.text, borderColor: dark.border }}
              >
                Yangilash
              </Button>
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={() => {
                  setCreated(null);
                  setCreateOpen(true);
                }}
                sx={{ bgcolor: dark.accent, color: '#06263a', '&:hover': { bgcolor: '#5fcbf9' } }}
              >
                Yangi kalit
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={3} sx={{ mt: 2.5, position: 'relative' }}>
            {[
              ['Faol kalitlar', tokenList.filter((t) => t.active).length],
              ['Jami urinishlar', totalHits],
              ['Tuzoqqa tushgan IP', new Set(triggerList.map((t) => t.ip)).size]
            ].map(([label, value]) => (
              <Box key={label}>
                <Typography variant="h3" sx={{ color: value && label !== 'Faol kalitlar' ? dark.danger : dark.accent }}>
                  {number(value)}
                </Typography>
                <Typography variant="caption" sx={{ color: dark.sub }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {notice && (
          <Alert severity={notice.severity} onClose={() => setNotice(null)}>
            {notice.message}
          </Alert>
        )}

        {/* Caught attackers */}
        <Box sx={panelSx}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2.5, pb: 1.5 }}>
            <ThunderboltFilled style={{ color: dark.danger }} />
            <Typography variant="h4" sx={{ color: dark.text }}>
              Tuzoqqa tushgan hujumchilar
            </Typography>
            <Chip size="small" label={number(triggerList.length)} sx={{ bgcolor: alpha(dark.danger, 0.15), color: dark.danger }} />
          </Stack>
          <Divider sx={{ borderColor: dark.border }} />
          {!triggers.data && !triggers.error && (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <CircularProgress sx={{ color: dark.accent }} />
            </Box>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Manba (IP / joy)', 'Tarmoq', 'Provayder', 'Qurilma / vosita', 'Urinish', 'Oxirgi', 'Amal'].map((t) => (
                    <TableCell key={t} sx={headSx}>
                      {t}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {triggerList.map((row) => (
                  <TableRow key={row.ip} hover sx={{ '&:hover': { bgcolor: alpha(dark.accent, 0.04) } }}>
                    <TableCell sx={cellSx}>
                      <IpCell ip={row.ip} intel={row.intel} spoof={row.spoof_attempt} onOpen={() => setDossierIp(row.ip)} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <NetworkChip intel={row.intel} />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, maxWidth: 200 }}>
                      <Typography variant="body2" noWrap sx={{ color: dark.text }} title={row.intel?.isp}>
                        {row.intel?.isp || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: dark.sub }}>
                        {row.intel?.asn ? `AS${row.intel.asn}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <ClientInfo client={row.client} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Typography fontWeight={700} sx={{ color: dark.danger }}>
                        {number(row.occurrences)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Tooltip title={time(row.last_seen)}>
                        <span style={{ color: dark.sub }}>{relativeTime(row.last_seen)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Button size="small" onClick={() => setDossierIp(row.ip)} sx={{ color: dark.accent }}>
                        Dosye
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {triggers.data && !triggerList.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ ...cellSx, py: 6, color: dark.sub }}>
                      Hali hech kim tuzoqqa tushmagan. Kalitni biror joyga “qo‘ying” va kuting. 🪤
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Tokens */}
        <Box sx={panelSx}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2.5, pb: 1.5 }}>
            <ApiOutlined style={{ color: dark.accent }} />
            <Typography variant="h4" sx={{ color: dark.text }}>
              Mening tuzoq kalitlarim
            </Typography>
          </Stack>
          <Divider sx={{ borderColor: dark.border }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Nom', 'Kalit qiymati', 'Qayerga qo‘yilgan', 'Holat', 'Urinish', 'Oxirgi tushgan', 'Amal'].map((t) => (
                    <TableCell key={t} sx={headSx}>
                      {t}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tokenList.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={cellSx}>{item.label}</TableCell>
                    <TableCell sx={cellSx}>
                      <TokenValue token={item.token} />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: dark.sub, maxWidth: 220, overflowWrap: 'anywhere' }}>
                      {item.placement || '—'}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Stack direction="row" alignItems="center">
                        <Switch size="small" checked={item.active} onChange={() => toggle(item)} />
                        <Typography variant="caption" sx={{ color: item.active ? dark.accent : dark.sub }}>
                          {item.active ? 'Faol' : 'O‘chiq'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip
                        size="small"
                        label={number(item.triggers)}
                        sx={{
                          bgcolor: item.triggers ? alpha(dark.danger, 0.15) : alpha('#ffffff', 0.06),
                          color: item.triggers ? dark.danger : dark.sub
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ ...cellSx, color: dark.sub }}>
                      {item.last_triggered_at ? relativeTime(item.last_triggered_at) : '—'}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Tooltip title="O‘chirish">
                        <IconButton size="small" onClick={() => setConfirmDelete(item)} sx={{ color: dark.danger }}>
                          <DeleteOutlined style={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {tokens.data && !tokenList.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ ...cellSx, py: 6, color: dark.sub }}>
                      Hali tuzoq kalit yo‘q. “Yangi kalit” tugmasini bosing.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Alert
          severity="info"
          sx={{ bgcolor: dark.panelSoft, color: dark.text, border: `1px solid ${dark.border}`, '& .MuiAlert-icon': { color: dark.accent } }}
        >
          <strong>Qanday ishlatiladi:</strong> kalitni hujumchi topadigan, lekin oddiy foydalanuvchi ko‘rmaydigan joyga qo‘ying — masalan{' '}
          <code>robots.txt</code> izohiga, eski API hujjatiga, yashirin <code>config</code> faylga yoki soxta <code>/api/admin/keys</code>{' '}
          javobiga. Kim shu kalit bilan so‘rov yuborsa, darhol bloklanadi va yuqorida ko‘rinadi. Kalit hech qanday zararli kod emas —
          shunchaki belgilangan “tuzoq”.
        </Alert>
      </Stack>

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => !busy && setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yangi tuzoq kalit</DialogTitle>
        <DialogContent>
          {!created ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {notice?.severity === 'error' && <Alert severity="error">{notice.message}</Alert>}
              <TextField
                label="Nom (sizga eslatma uchun)"
                value={form.label}
                placeholder="Masalan: robots.txt tuzog‘i"
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                inputProps={{ maxLength: 160 }}
                autoFocus
              />
              <TextField
                label="Qayerga qo‘yasiz (ixtiyoriy)"
                value={form.placement}
                placeholder="robots.txt izohi / eski hujjat / config"
                onChange={(e) => setForm((p) => ({ ...p, placement: e.target.value }))}
                inputProps={{ maxLength: 200 }}
              />
              <Alert severity="info">
                Kalit yaratilgach uni nusxalab, tanlagan joyingizga joylashtirasiz. Haqiqiy foydalanuvchi uni ko‘rmasligi kerak.
              </Alert>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="success">Kalit yaratildi. Pastdagi qiymatni nusxalab kerakli joyga qo‘ying.</Alert>
              <TextField
                label="Tuzoq kalit"
                value={created.token}
                fullWidth
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: dark.mono, fontSize: 13 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => navigator.clipboard?.writeText(created.token)}>
                        <CopyOutlined />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Masalan <code>robots.txt</code> ga quyidagicha izoh qo‘shsangiz bo‘ladi:
                <br />
                <code># internal api key (do not share): {created.token}</code>
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={busy}>
            {created ? 'Yopish' : 'Bekor qilish'}
          </Button>
          {!created && (
            <Button variant="contained" onClick={submitCreate} disabled={busy || form.label.trim().length < 2}>
              {busy ? 'Yaratilmoqda…' : 'Yaratish'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(confirmDelete)} onClose={() => !busy && setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Tuzoq kalitni o‘chirish</DialogTitle>
        <DialogContent>
          <Typography>
            “{confirmDelete?.label}” kaliti o‘chiriladi. Bundan keyin uni ishlatgan so‘rovlar oddiy so‘rov sifatida qabul qilinadi.
            O‘chirish tarixdagi hodisalarga ta’sir qilmaydi.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)} disabled={busy}>
            Bekor
          </Button>
          <Button color="error" variant="contained" onClick={() => removeToken(confirmDelete.id)} disabled={busy}>
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>

      <IpDossierDialog ip={dossierIp} typeLabels={typeLabels} onClose={() => setDossierIp(null)} onBlock={block} onUnblock={unblock} />
    </Box>
  );
}
