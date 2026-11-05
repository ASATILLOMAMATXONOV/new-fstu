import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useSWR, { mutate as mutateCache } from 'swr';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { DownOutlined, LockOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import IpDossierDialog from 'components/security/IpDossierDialog';
import { number, time } from 'components/security/SecurityWidgets';
import useAuth from 'hooks/useAuth';
import { blockSecurityIp, securityFetcher, unblockSecurityIp } from 'api/security';

const types = {
  login_step: 'Kirishni tasdiqlash',
  login_success: 'Admin tizimga kirdi',
  login_failure: 'Noto‘g‘ri login yoki parol',
  login_rate_limit: 'Login urinishlari cheklovi',
  mfa_failure: 'Tasdiqlash kodi rad etildi',
  logout: 'Sessiya tugatildi',
  authentication_failure: 'Tasdiqlanmagan kirish',
  access_denied: 'Ruxsatsiz amal',
  sensitive_probe: 'Maxfiy fayl qidirish',
  path_traversal: 'Fayllarga noqonuniy kirish urinishi',
  sql_probe: 'SQL hujum urinishi',
  xss_probe: 'Zararli skript urinishi',
  request_flood: 'Haddan tashqari ko‘p so‘rov',
  write_rate_limit: 'Yozish tezligi cheklovi',
  blocked_request: 'Bloklangan IP qayta murojaat qildi',
  manual_block: 'Super admin IP’ni blokladi',
  manual_unblock: 'Super admin blokni ochdi',
  server_error: 'Server xatosi',
  invalid_body: 'Noto‘g‘ri JSON',
  oversized_body: 'So‘rov hajmi cheklovi',
  oversized_url: 'Manzil uzunligi cheklovi',
  invalid_method: 'Ruxsat etilmagan HTTP usuli',
  admin_change: 'Admin hisobi o‘zgartirildi',
  header_spoof: 'Soxta IP sarlavhasi',
  honeytoken: 'Tuzoq kalit ishlatildi',
  honeytoken_created: 'Tuzoq kalit yaratildi'
};
const actions = { observed: 'Qayd etildi', rejected: 'Rad etildi', blocked: 'Bloklandi', unblocked: 'Blok ochildi' };
const severities = { info: 'Axborot', medium: 'O‘rta', high: 'Yuqori', critical: 'Jiddiy' };
const options = { refreshInterval: 15000, revalidateOnFocus: true, shouldRetryOnError: false, dedupingInterval: 3000 };
const tableSx = { '& th': { bgcolor: 'background.default', whiteSpace: 'nowrap' }, '& td': { verticalAlign: 'top' } };
const active = (until) => Boolean(until && new Date(until).getTime() > Date.now());
const params = (values) => new URLSearchParams(values).toString();

function ResourceState({ resource }) {
  return (
    <>
      {resource.isValidating && <LinearProgress aria-label="Ma’lumot yangilanmoqda" />}
      {resource.error && (
        <Alert severity="error" sx={{ my: 2 }}>
          Ma’lumot yangilanmadi: {resource.error.message}. Oldingi ma’lumot eskirgan bo‘lishi mumkin.
        </Alert>
      )}
    </>
  );
}
ResourceState.propTypes = { resource: PropTypes.object.isRequired };

function EmptyRow({ resource, columns, text }) {
  if (resource.data?.items?.length) return null;
  return (
    <TableRow>
      <TableCell colSpan={columns} align="center" sx={{ py: 5, color: 'text.secondary' }}>
        {resource.isLoading ? 'Yuklanmoqda…' : resource.error ? 'Ma’lumotni olishning imkoni bo‘lmadi.' : text}
      </TableCell>
    </TableRow>
  );
}
EmptyRow.propTypes = { resource: PropTypes.object.isRequired, columns: PropTypes.number.isRequired, text: PropTypes.string.isRequired };

function Pager({ resource, page, setPage, limit, setLimit }) {
  const total = resource.data?.total;
  useEffect(() => {
    if (Number.isFinite(total) && page > 0 && page * limit >= total) setPage(Math.max(0, Math.ceil(total / limit) - 1));
  }, [total, page, limit, setPage]);
  return (
    <TablePagination
      component="div"
      count={total ?? -1}
      page={page}
      rowsPerPage={limit}
      rowsPerPageOptions={setLimit ? [25, 50, 100] : [25]}
      onPageChange={(_event, value) => setPage(value)}
      onRowsPerPageChange={(event) => {
        setLimit?.(Number(event.target.value));
        setPage(0);
      }}
      labelRowsPerPage="Qatorlar:"
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count === -1 ? '…' : count}`}
    />
  );
}
Pager.propTypes = {
  resource: PropTypes.object.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func
};

function IpButton({ ip, onClick, currentIp }) {
  return (
    <Stack spacing={0.5} alignItems="flex-start">
      <Button size="small" onClick={() => onClick(ip)} sx={{ p: 0, minWidth: 0, fontFamily: 'monospace', textTransform: 'none' }}>
        {ip}
      </Button>
      {ip === currentIp && <Chip size="small" variant="outlined" label="Sizning IP" />}
    </Stack>
  );
}
IpButton.propTypes = { ip: PropTypes.string.isRequired, onClick: PropTypes.func.isRequired, currentIp: PropTypes.string };

function EventTable({ resource, onIp, currentIp, timeline = false }) {
  return (
    <TableContainer>
      <Table size="small" sx={{ ...tableSx, minWidth: 800 }}>
        <TableHead>
          <TableRow>
            {(timeline
              ? ['Birinchi / oxirgi vaqt', 'Nima qildi?', 'Chora', 'Soni']
              : ['Vaqt', 'IP manzili', 'Nima qildi?', 'Xavf', 'Chora', 'Soni']
            ).map((title) => (
              <TableCell key={title}>{title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(resource.data?.items || []).map((item) => (
            <TableRow hover key={item.id}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                {timeline && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {time(item.first_seen)}
                  </Typography>
                )}
                {time(item.last_seen)}
              </TableCell>
              {!timeline && (
                <TableCell>
                  <IpButton ip={item.ip} onClick={onIp} currentIp={currentIp} />
                </TableCell>
              )}
              <TableCell sx={{ maxWidth: 420, overflowWrap: 'anywhere' }}>
                <Typography variant="body2" fontWeight={600}>
                  {types[item.event_type] || item.event_type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.summary}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.method} {item.path} · HTTP {item.status_code}
                  {item.actor_id ? ` · Admin #${item.actor_id}` : ''}
                </Typography>
              </TableCell>
              {!timeline && (
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={['high', 'critical'].includes(item.severity) ? 'error' : item.severity === 'medium' ? 'warning' : 'default'}
                    label={severities[item.severity] || item.severity}
                  />
                </TableCell>
              )}
              <TableCell>
                <Chip
                  size="small"
                  color={item.action === 'blocked' ? 'error' : item.action === 'rejected' ? 'warning' : 'default'}
                  label={actions[item.action] || item.action}
                />
              </TableCell>
              <TableCell>{number(item.occurrences)}</TableCell>
            </TableRow>
          ))}
          <EmptyRow resource={resource} columns={timeline ? 4 : 6} text="Tanlangan davr va filtrlarda hodisalar yo‘q." />
        </TableBody>
      </Table>
    </TableContainer>
  );
}
EventTable.propTypes = {
  resource: PropTypes.object.isRequired,
  onIp: PropTypes.func,
  currentIp: PropTypes.string,
  timeline: PropTypes.bool
};

export default function CybersecurityPage() {
  const { user } = useAuth();
  const authorized = user?.role === 'super_admin';
  const [tab, setTab] = useState(0);
  const [hours, setHours] = useState(24);
  const [ipInput, setIpInput] = useState('');
  const [ip, setIp] = useState('');
  const [status, setStatus] = useState('all');
  const [eventType, setEventType] = useState('');
  const [action, setAction] = useState('');
  const [blockSource, setBlockSource] = useState('');
  const [sourcePage, setSourcePage] = useState(0);
  const [eventPage, setEventPage] = useState(0);
  const [blockPage, setBlockPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [selectedIp, setSelectedIp] = useState(null);
  const [detailPage, setDetailPage] = useState(0);
  const [dossierIp, setDossierIp] = useState(null);
  const [unblockIp, setUnblockIp] = useState(null);
  const [form, setForm] = useState({ ip: '', minutes: 60, reason: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [actionError, setActionError] = useState('');
  const overview = useSWR(authorized ? `/api/security/overview?hours=${hours}&compact=1` : null, securityFetcher, options);
  const sources = useSWR(
    authorized && tab === 0 ? `/api/security/sources?${params({ hours, page: sourcePage, limit, ip, status })}` : null,
    securityFetcher,
    options
  );
  const events = useSWR(
    authorized && tab === 1
      ? `/api/security/events?${params({ hours, page: eventPage, limit, ip, type: eventType, action, compact: 1 })}`
      : null,
    securityFetcher,
    options
  );
  const blocks = useSWR(
    authorized && tab === 2 ? `/api/security/blocks?${params({ page: blockPage, limit, ip, source: blockSource })}` : null,
    securityFetcher,
    options
  );
  const detail = useSWR(
    authorized && selectedIp ? `/api/security/events?${params({ hours, ip: selectedIp, page: detailPage, limit: 25, compact: 1 })}` : null,
    securityFetcher,
    options
  );
  const detailSource = useSWR(
    authorized && selectedIp ? `/api/security/sources?${params({ hours, ip: selectedIp, limit: 1 })}` : null,
    securityFetcher,
    options
  );
  const data = overview.data;
  const source = detailSource.data?.items?.[0];
  const selectedBlock = detailSource.data?.block;
  const currentIp = data?.currentIp;

  function resetPages() {
    setSourcePage(0);
    setEventPage(0);
    setBlockPage(0);
  }
  function openDetails(value) {
    setSelectedIp(value);
    setDetailPage(0);
  }
  function openBlock(value = '') {
    setSelectedIp(null);
    setDossierIp(null);
    setForm({ ip: value, minutes: 60, reason: '' });
    setActionError('');
    setNotice(null);
    setTab(3);
  }
  function openUnblock(value) {
    setSelectedIp(null);
    setDossierIp(null);
    setActionError('');
    setUnblockIp(value);
  }
  const refresh = () =>
    Promise.allSettled([
      overview.mutate(),
      sources.mutate(),
      events.mutate(),
      blocks.mutate(),
      detail.mutate(),
      detailSource.mutate(),
      mutateCache((key) => typeof key === 'string' && key.startsWith('/api/security/'))
    ]);
  async function applyBlock(event) {
    event.preventDefault();
    setBusy(true);
    setActionError('');
    setNotice(null);
    try {
      await blockSecurityIp({ ip: form.ip.trim(), minutes: Number(form.minutes), reason: form.reason.trim() });
      setNotice({ severity: 'success', message: `${form.ip.trim()} bloklandi. Bu IP’ning keyingi API so‘rovlari serverda rad etiladi.` });
      setForm({ ip: '', minutes: 60, reason: '' });
      setIp('');
      setIpInput('');
      setBlockSource('');
      setBlockPage(0);
      setTab(2);
      await refresh();
    } catch (failure) {
      setActionError(failure.message || 'IP bloklanmadi. Qayta urinib ko‘ring.');
    } finally {
      setBusy(false);
    }
  }
  async function applyUnblock() {
    setBusy(true);
    setActionError('');
    setNotice(null);
    try {
      await unblockSecurityIp(unblockIp);
      setNotice({ severity: 'success', message: `${unblockIp} uchun blok ochildi. Amal jurnalga yozildi.` });
      setUnblockIp(null);
      await refresh();
    } catch (failure) {
      setActionError(failure.message || 'Blok ochilmadi.');
    } finally {
      setBusy(false);
    }
  }
  if (!authorized) return <Alert severity="error">Bu bo‘lim faqat super admin uchun ochiq.</Alert>;

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2}>
        <Box>
          <Typography variant="h3">Kiberxavfsizlik markazi</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            IP faoliyati, xavfsizlik hodisalari va bloklarni boshqarish.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Har 15 soniyada yangilanadi · Toshkent vaqti (UTC+5) · Oxirgi yangilanish: {time(data?.timestamp)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            variant="outlined"
            color={overview.error ? 'error' : data ? 'success' : 'default'}
            label={overview.error ? 'Aloqa xatosi' : data ? 'Server bilan aloqa bor' : 'Ulanmoqda…'}
          />
          <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={refresh} disabled={overview.isValidating}>
            Yangilash
          </Button>
        </Stack>
      </Stack>
      {notice && (
        <Alert severity={notice.severity} onClose={() => setNotice(null)}>
          {notice.message}
        </Alert>
      )}
      <ResourceState resource={overview} />
      {Boolean(data?.monitor?.dropped) && (
        <Alert severity="warning">Yuqori yuklama sabab {number(data.monitor.dropped)} ta hodisa yozilmay qolgan.</Alert>
      )}
      {data?.monitor?.lastErrorAt && (
        <Alert severity="warning">Kuzatuv omborida oxirgi xato: {time(data.monitor.lastErrorAt)}. Jurnal to‘liqligini tekshiring.</Alert>
      )}
      <Grid container spacing={2} sx={{ width: 'auto' }}>
        {[
          ['Xavf qayd etilgan IP', data?.totals?.sources, 'Tanlangan davrda'],
          ['Rad etilgan so‘rovlar', data?.totals?.prevented, 'Tanlangan davrda'],
          ['Faol IP bloklari', data?.totals?.activeBlocks, 'Hozir bloklangan'],
          ['Kirish xatolari', data?.totals?.login_failures, 'Login va tasdiqlash kodlari']
        ].map(([title, value, hint]) => (
          <Grid item xs={6} md={3} key={title}>
            <MainCard contentSX={{ p: 2 }}>
              <Typography color="text.secondary" variant="body2">
                {title}
              </Typography>
              <Typography variant="h3" sx={{ my: 0.5 }}>
                {data ? number(value) : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {hint}
              </Typography>
            </MainCard>
          </Grid>
        ))}
      </Grid>

      <MainCard content={false}>
        <Tabs
          value={tab}
          onChange={(_event, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Xavfsizlik bo‘limlari"
        >
          {['IP faolligi', 'Hodisalar jurnali', 'Bloklangan IP’lar', 'IP bloklash', 'Himoya holati'].map((label, index) => (
            <Tab key={label} label={label} id={`security-tab-${index}`} aria-controls={`security-panel-${index}`} />
          ))}
        </Tabs>
        <Divider />
        <Box role="tabpanel" id={`security-panel-${tab}`} aria-labelledby={`security-tab-${tab}`} sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {tab <= 2 && (
            <Stack spacing={2} sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1}>
                <Box>
                  <Typography variant="h5">
                    {tab === 0
                      ? 'IP manzillarining qayd etilgan faoliyati'
                      : tab === 1
                        ? 'Nima sodir bo‘ldi va qanday chora ko‘rildi?'
                        : 'Hozir bloklangan IP manzillar'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {tab === 0
                      ? 'IP ustiga bosing: harakatlar tarixi va so‘ralgan manzillar ochiladi.'
                      : tab === 1
                        ? 'Xavfsizlik hodisalari va admin kirishlari.'
                        : 'Faqat muddati tugamagan bloklar. Yangi blok qo‘yish uchun «IP bloklash» bo‘limidan foydalaning.'}
                  </Typography>
                </Box>
                {tab === 2 && (
                  <Button startIcon={<LockOutlined />} variant="outlined" onClick={() => openBlock()}>
                    IP bloklash bo‘limi
                  </Button>
                )}
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
                <Box
                  component="form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setIp(ipInput.trim());
                    resetPages();
                  }}
                  sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
                >
                  <TextField
                    size="small"
                    label="Aniq IP manzili"
                    placeholder="IPv4 yoki IPv6"
                    value={ipInput}
                    onChange={(event) => setIpInput(event.target.value)}
                    inputProps={{ maxLength: 45 }}
                  />
                  <Button type="submit" variant="outlined" startIcon={<SearchOutlined />}>
                    Qidirish
                  </Button>
                  {ip && (
                    <Button
                      onClick={() => {
                        setIp('');
                        setIpInput('');
                        resetPages();
                      }}
                    >
                      Tozalash
                    </Button>
                  )}
                </Box>
                {tab !== 2 && (
                  <TextField
                    select
                    size="small"
                    label="Davr"
                    value={hours}
                    sx={{ minWidth: 165 }}
                    onChange={(event) => {
                      setHours(Number(event.target.value));
                      resetPages();
                      setDetailPage(0);
                    }}
                  >
                    <MenuItem value={1}>Oxirgi 1 soat</MenuItem>
                    <MenuItem value={24}>Oxirgi 24 soat</MenuItem>
                    <MenuItem value={168}>Oxirgi 7 kun</MenuItem>
                    <MenuItem value={720}>Oxirgi 30 kun</MenuItem>
                  </TextField>
                )}
                {tab === 0 && (
                  <TextField
                    select
                    size="small"
                    label="Holat"
                    value={status}
                    sx={{ minWidth: 165 }}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setSourcePage(0);
                    }}
                  >
                    <MenuItem value="all">Barcha qayd etilgan IP</MenuItem>
                    <MenuItem value="suspicious">Shubhali hodisali IP</MenuItem>
                    <MenuItem value="blocked">Hozir bloklangan</MenuItem>
                  </TextField>
                )}
                {tab === 1 && (
                  <>
                    <TextField
                      select
                      size="small"
                      label="Hodisa turi"
                      value={eventType}
                      sx={{ minWidth: 190 }}
                      onChange={(event) => {
                        setEventType(event.target.value);
                        setEventPage(0);
                      }}
                    >
                      <MenuItem value="">Barcha hodisalar</MenuItem>
                      {Object.entries(types).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      size="small"
                      label="Chora"
                      value={action}
                      sx={{ minWidth: 150 }}
                      onChange={(event) => {
                        setAction(event.target.value);
                        setEventPage(0);
                      }}
                    >
                      <MenuItem value="">Barcha choralar</MenuItem>
                      {Object.entries(actions).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                )}
                {tab === 2 && (
                  <TextField
                    select
                    size="small"
                    label="Kim bloklagan?"
                    value={blockSource}
                    sx={{ minWidth: 170 }}
                    onChange={(event) => {
                      setBlockSource(event.target.value);
                      setBlockPage(0);
                    }}
                  >
                    <MenuItem value="">Barcha bloklar</MenuItem>
                    <MenuItem value="automatic">Avtomatik himoya</MenuItem>
                    <MenuItem value="manual">Super admin</MenuItem>
                  </TextField>
                )}
              </Stack>
            </Stack>
          )}

          {tab === 0 && (
            <>
              <ResourceState resource={sources} />
              <TableContainer>
                <Table size="small" sx={{ ...tableSx, minWidth: 1050 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        'IP manzili',
                        'Oxirgi harakati',
                        'Birinchi / oxirgi faollik',
                        'Oxirgi admin kirishi',
                        'Soni',
                        'Hozirgi holati',
                        'Amal'
                      ].map((title) => (
                        <TableCell key={title}>{title}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(sources.data?.items || []).map((item) => (
                      <TableRow hover key={item.ip}>
                        <TableCell>
                          <IpButton ip={item.ip} onClick={openDetails} currentIp={currentIp} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 280, overflowWrap: 'anywhere' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {types[item.event_type] || item.event_type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.method} {item.path} · HTTP {item.status_code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actions[item.action] || item.action}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Birinchi: {time(item.first_seen)}
                          </Typography>
                          <Typography variant="body2">Oxirgi: {time(item.last_seen)}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 170 }}>
                          {item.last_login_at ? (
                            time(item.last_login_at)
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Tasdiqlangan kirish qayd etilmagan
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{number(item.attempts)}</TableCell>
                        <TableCell>
                          {active(item.blocked_until) ? (
                            <>
                              <Chip size="small" color="error" label="Bloklangan" />
                              <Typography display="block" variant="caption" sx={{ mt: 0.5 }}>
                                Tugashi: {time(item.blocked_until)}
                              </Typography>
                            </>
                          ) : (
                            <Chip
                              size="small"
                              variant="outlined"
                              color={item.suspicious ? 'warning' : 'default'}
                              label={item.suspicious ? 'Shubhali hodisa' : 'Qayd etilgan'}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => openDetails(item.ip)}>
                            Tarixni ko‘rish
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <EmptyRow resource={sources} columns={7} text="Tanlangan davr va filtrda IP faoliyati qayd etilmagan." />
                  </TableBody>
                </Table>
              </TableContainer>
              <Pager resource={sources} page={sourcePage} setPage={setSourcePage} limit={limit} setLimit={setLimit} />
              <Typography variant="caption" color="text.secondary">
                Birinchi va oxirgi vaqt tanlangan davrga tegishli. Oddiy sahifa ko‘rishlarining barchasi jurnalga yozilmaydi; muvaffaqiyatli
                admin kirishi alohida qayd etiladi.
              </Typography>
            </>
          )}
          {tab === 1 && (
            <>
              <ResourceState resource={events} />
              <EventTable resource={events} onIp={openDetails} currentIp={currentIp} />
              <Pager resource={events} page={eventPage} setPage={setEventPage} limit={limit} setLimit={setLimit} />
              <Typography variant="caption" color="text.secondary">
                Bir daqiqadagi bir xil hodisalar soni birlashtiriladi. Chora hodisa paytidagi natija; joriy bloklar alohida bo‘limda.
              </Typography>
            </>
          )}
          {tab === 2 && (
            <>
              <ResourceState resource={blocks} />
              <TableContainer>
                <Table size="small" sx={{ ...tableSx, minWidth: 850 }}>
                  <TableHead>
                    <TableRow>
                      {['IP manzili', 'Blok sababi', 'Kim bloklagan?', 'Blok qo‘yilgan vaqt', 'Blok tugashi', 'Amal'].map((title) => (
                        <TableCell key={title}>{title}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(blocks.data?.items || []).map((item) => (
                      <TableRow hover key={item.ip}>
                        <TableCell>
                          <IpButton ip={item.ip} onClick={openDetails} currentIp={currentIp} />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 350, overflowWrap: 'anywhere' }}>{item.reason}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              item.source === 'automatic'
                                ? 'Avtomatik himoya'
                                : `Super admin${item.created_by ? ` #${item.created_by}` : ''}`
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{time(item.created_at)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{time(item.blocked_until)}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => openUnblock(item.ip)} disabled={busy}>
                            Blokni ochish
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <EmptyRow
                      resource={blocks}
                      columns={6}
                      text="Faol IP bloklari yo‘q. Muddati tugagan va ochilgan bloklar hodisalar jurnalida saqlanadi."
                    />
                  </TableBody>
                </Table>
              </TableContainer>
              <Pager resource={blocks} page={blockPage} setPage={setBlockPage} limit={limit} setLimit={setLimit} />
            </>
          )}

          {tab === 3 && (
            <Box component="form" onSubmit={applyBlock} sx={{ maxWidth: 620 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5">IP manzilini bloklash</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Manzil, sabab va muddatni kiriting. Blok serverda saqlanadi va amal jurnalga yoziladi.
                  </Typography>
                </Box>
                {actionError && <Alert severity="error">{actionError}</Alert>}
                <TextField
                  label="IPv4 yoki IPv6 manzili"
                  value={form.ip}
                  onChange={(event) => setForm({ ...form, ip: event.target.value })}
                  required
                  disabled={busy}
                  inputProps={{ maxLength: 45 }}
                />
                <TextField
                  select
                  label="Blok muddati"
                  value={form.minutes}
                  onChange={(event) => setForm({ ...form, minutes: event.target.value })}
                  disabled={busy}
                >
                  <MenuItem value={15}>15 daqiqa</MenuItem>
                  <MenuItem value={60}>1 soat</MenuItem>
                  <MenuItem value={360}>6 soat</MenuItem>
                  <MenuItem value={1440}>24 soat</MenuItem>
                </TextField>
                <TextField
                  label="Bloklash sababi"
                  multiline
                  minRows={3}
                  helperText="Kamida 5 belgi. IP nima qilganini qisqa yozing."
                  value={form.reason}
                  onChange={(event) => setForm({ ...form, reason: event.target.value })}
                  required
                  disabled={busy}
                  inputProps={{ minLength: 5, maxLength: 300 }}
                />
                <Alert severity="info">
                  Joriy IP manzilingiz: <strong>{currentIp || 'Yuklanmoqda…'}</strong>. O‘z ulanish IP’ingizni qo‘lda bloklab bo‘lmaydi.
                  Bitta umumiy IP’dan boshqa foydalanuvchilar ham foydalanishi mumkin.
                </Alert>
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  startIcon={<LockOutlined />}
                  disabled={busy || !form.ip.trim() || form.reason.trim().length < 5 || form.ip.trim() === currentIp}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {busy ? 'Bloklanmoqda…' : 'IP’ni bloklash'}
                </Button>
              </Stack>
            </Box>
          )}

          {tab === 4 && (
            <Stack spacing={2}>
              <Typography variant="h5">Serverdagi himoya holati</Typography>
              {data && (
                <Alert severity="info">
                  Login: {data.policy.loginLimit} urinish / {data.policy.loginWindowMinutes} daqiqa. Umumiy so‘rovlar:{' '}
                  {data.policy.requestLimit} / daqiqa. Yozish: {data.policy.writeLimit} / daqiqa. Avtomatik blok: {data.policy.blockMinutes}{' '}
                  daqiqa. Jurnal: {data.policy.retentionDays} kun.
                </Alert>
              )}
              {data?.accountSecurity && (
                <Alert
                  severity={
                    data.accountSecurity.enrolled < data.accountSecurity.total || data.accountSecurity.password_reset_required
                      ? 'warning'
                      : 'success'
                  }
                >
                  Faol adminlar: {number(data.accountSecurity.total)} · Autentifikator ulangan: {number(data.accountSecurity.enrolled)} ·
                  Parolini yangilashi kerak: {number(data.accountSecurity.password_reset_required)} · Bloklangan hisoblar:{' '}
                  {number(data.accountSecurity.locked)}.
                </Alert>
              )}
              {(data?.checks || []).map((check) => (
                <Alert key={check.id} severity={check.ok ? 'success' : 'warning'}>
                  <strong>{check.title}</strong> — {check.detail}
                </Alert>
              ))}
              <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <AccordionSummary expandIcon={<DownOutlined />}>
                  <Typography fontWeight={600}>Paketlar xavfsizlik auditi · {time(data?.audit?.checkedAt)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {(!data?.audit?.projects?.length || data?.audit?.stale) && (
                      <Alert severity="warning">Audit natijasi mavjud emas yoki eskirgan.</Alert>
                    )}
                    {(data?.audit?.projects || []).map((project) => (
                      <Box key={project.name}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {project.name}
                        </Typography>
                        {!project.available ? (
                          <Alert severity="warning">{project.message}</Alert>
                        ) : (
                          <Stack spacing={1}>
                            <Stack direction="row" gap={1} flexWrap="wrap">
                              {['critical', 'high', 'moderate', 'low'].map((level) => (
                                <Chip
                                  key={level}
                                  size="small"
                                  color={project.counts[level] ? 'warning' : 'default'}
                                  label={`${level}: ${number(project.counts[level])}`}
                                />
                              ))}
                            </Stack>
                            {(project.findings || []).map((finding) => (
                              <Typography variant="body2" color="text.secondary" key={finding.name}>
                                {finding.name} · {finding.severity} ·{' '}
                                {finding.fixRequiresMajor
                                  ? 'Katta versiya yangilanishi kerak'
                                  : finding.fixAvailable
                                    ? 'Yangilash mavjud'
                                    : 'Tuzatish rejasini tekshiring'}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
              <Typography variant="body2" color="text.secondary">
                Himoya API so‘rovlariga qo‘llanadi va ushbu sahifa yopiq paytda ham ishlaydi. IP manzili biror shaxs kimligini
                tasdiqlamaydi. Tarmoq DDoS himoyasi va server infratuzilmasi alohida sozlanadi.
              </Typography>
            </Stack>
          )}
        </Box>
      </MainCard>

      <Dialog open={Boolean(selectedIp)} onClose={() => setSelectedIp(null)} maxWidth="lg" fullWidth>
        <DialogTitle>IP faoliyati: {selectedIp}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Tanlangan davr: {hours} soat · Toshkent vaqti (UTC+5). Bloklash va blokni ochish yozuvlari ham tarixda ko‘rsatiladi.
            </Typography>
            <ResourceState resource={detailSource} />
            {source && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Birinchi faollik
                  </Typography>
                  <Typography>{time(source.first_seen)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Oxirgi faollik
                  </Typography>
                  <Typography>{time(source.last_seen)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Oxirgi muvaffaqiyatli admin kirishi
                  </Typography>
                  <Typography>{source.last_login_at ? time(source.last_login_at) : 'Qayd etilmagan'}</Typography>
                </Box>
              </Stack>
            )}
            {detailSource.data && (
              <Chip
                size="small"
                sx={{ alignSelf: 'flex-start' }}
                color={active(selectedBlock?.blocked_until) ? 'error' : 'default'}
                label={active(selectedBlock?.blocked_until) ? 'Hozir bloklangan' : 'Faol blok yo‘q'}
              />
            )}
            {active(selectedBlock?.blocked_until) && (
              <Alert severity="error">
                Blok sababi: {selectedBlock.reason} · Qo‘yilgan: {time(selectedBlock.created_at)} · Tugashi:{' '}
                {time(selectedBlock.blocked_until)}
              </Alert>
            )}
            <ResourceState resource={detail} />
            <EventTable resource={detail} timeline />
            <Pager resource={detail} page={detailPage} setPage={setDetailPage} limit={25} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={() => {
              setDossierIp(selectedIp);
              setSelectedIp(null);
            }}
          >
            Tarmoq tafsilotlari
          </Button>
          {active(selectedBlock?.blocked_until) ? (
            <Button onClick={() => openUnblock(selectedIp)}>Blokni ochish</Button>
          ) : (
            <Button color="error" disabled={selectedIp === currentIp || !detailSource.data} onClick={() => openBlock(selectedIp)}>
              Bloklash bo‘limiga o‘tish
            </Button>
          )}
          <Button onClick={() => setSelectedIp(null)}>Yopish</Button>
        </DialogActions>
      </Dialog>
      <IpDossierDialog
        ip={dossierIp}
        typeLabels={types}
        currentIp={currentIp}
        onClose={() => setDossierIp(null)}
        onBlock={openBlock}
        onUnblock={openUnblock}
      />
      <Dialog open={Boolean(unblockIp)} onClose={() => !busy && setUnblockIp(null)} maxWidth="sm" fullWidth>
        <DialogTitle>IP blokini ochish</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {actionError && <Alert severity="error">{actionError}</Alert>}
            <Typography>
              <strong>{unblockIp}</strong> uchun blok va IP urinish hisoblagichlari tozalanadi. Hisob paroli va MFA cheklovlari saqlanadi.
              Amal xavfsizlik jurnaliga yoziladi.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setUnblockIp(null)}>
            Bekor qilish
          </Button>
          <Button variant="contained" disabled={busy} onClick={applyUnblock}>
            {busy ? 'Bajarilmoqda…' : 'Blokni ochish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
