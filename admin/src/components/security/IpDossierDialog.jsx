import PropTypes from 'prop-types';
import useSWR from 'swr';
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
  Grid,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { EnvironmentOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';

import { securityFetcher } from 'api/security';
import { ClientInfo, Flag, NetworkChip, locationText, number, relativeTime, time } from './SecurityWidgets';

const severityColors = { info: 'info', medium: 'warning', high: 'error', critical: 'error' };

function Fact({ label, value, mono }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'action.hover', height: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: mono ? 'monospace' : undefined, overflowWrap: 'anywhere' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}
Fact.propTypes = { label: PropTypes.string, value: PropTypes.node, mono: PropTypes.bool };

function MapPreview({ intel }) {
  if (!Number.isFinite(intel?.lat) || !Number.isFinite(intel?.lon)) {
    return (
      <Alert severity="info" icon={<EnvironmentOutlined />}>
        Koordinata mavjud emas.
      </Alert>
    );
  }
  const delta = 0.35;
  const bbox = [intel.lon - delta, intel.lat - delta / 2, intel.lon + delta, intel.lat + delta / 2].map((v) => v.toFixed(4)).join(',');
  return (
    <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <Box
        component="iframe"
        title="Taxminiy joylashuv xaritasi"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${intel.lat},${intel.lon}`}
        sx={{ width: '100%', height: 240, border: 0, display: 'block' }}
        loading="lazy"
      />
      <Stack direction="row" justifyContent="space-between" sx={{ px: 1.5, py: 0.75, bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary">
          Shahar/provayder darajasidagi taxminiy nuqta
        </Typography>
        <Link
          variant="caption"
          href={`https://www.openstreetmap.org/?mlat=${intel.lat}&mlon=${intel.lon}#map=11/${intel.lat}/${intel.lon}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Kattaroq xarita
        </Link>
      </Stack>
    </Box>
  );
}
MapPreview.propTypes = { intel: PropTypes.object };

export default function IpDossierDialog({ ip, typeLabels, currentIp, onClose, onBlock, onUnblock }) {
  const key = ip ? `/api/security/ip/${encodeURIComponent(ip)}` : null;
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, securityFetcher, { revalidateOnFocus: false });
  const intel = data?.intel;
  const network = intel?.network;
  const anonymized = ['vpn', 'tor'].includes(network?.type);

  const refreshIntel = async () => {
    const fresh = await securityFetcher(`${key}?refresh=1`);
    await mutate(fresh, { revalidate: false });
  };

  return (
    <Dialog open={Boolean(ip)} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Flag code={intel?.countryCode} size={34} />
            <Box>
              <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                {ip}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {locationText(intel)}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {intel && <NetworkChip intel={intel} size="medium" />}
            {data?.summary?.spoof && <Chip color="error" label="Soxta IP sarlavhasi" />}
            {data?.block && <Chip color="error" variant="outlined" label={`Bloklangan · ${time(data.block.blocked_until)} gacha`} />}
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {(isLoading || !data) && !error && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">Dosye yuklanmadi: {error.message}</Alert>}
        {data && (
          <Stack spacing={3}>
            {network && (
              <Alert severity={anonymized ? 'error' : network.type === 'hosting' ? 'warning' : 'info'}>
                <strong>{network.label}.</strong> {network.note}
                {anonymized &&
                  ' VPN/Tor ortidagi haqiqiy IP ni server tomonidan aniqlab bo‘lmaydi — faqat VPN provayderi rasmiy so‘rov asosida bera oladi.'}
              </Alert>
            )}
            {!data.public && <Alert severity="info">Bu ichki (lokal) tarmoq manzili — geolokatsiya mavjud emas.</Alert>}

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  Tarmoq va joylashuv
                </Typography>
                <Grid container spacing={1.25}>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Davlat" value={intel?.country} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Viloyat" value={intel?.region} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Shahar / tuman" value={[intel?.city, intel?.district].filter(Boolean).join(', ')} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Provayder (ISP)" value={intel?.isp} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Tashkilot" value={intel?.org} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="ASN" value={intel?.asn ? `AS${intel.asn} · ${intel.asName || ''}` : intel?.asName} />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <Fact label="Reverse DNS (host nomi)" value={intel?.reverseDns} mono />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Vaqt zonasi" value={intel?.timezone} />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Koordinata (taxminiy)" value={Number.isFinite(intel?.lat) ? `${intel.lat}, ${intel.lon}` : ''} mono />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Fact label="Pochta indeksi" value={intel?.zip} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Fact
                      label="Belgilar"
                      value={
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.25 }}>
                          {intel?.tor && <Chip size="small" color="secondary" label="Tor" />}
                          {intel?.proxy && <Chip size="small" color="error" label="Proxy/VPN" />}
                          {intel?.hosting && <Chip size="small" color="warning" label="Hosting" />}
                          {intel?.mobile && <Chip size="small" color="info" label="Mobil" />}
                          {!intel?.tor && !intel?.proxy && !intel?.hosting && !intel?.mobile && <span>Yo‘q</span>}
                        </Stack>
                      }
                    />
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Ma’lumot yangilangan: {time(intel?.fetchedAt)} · IP egasining aniq manzili va shaxsi faqat provayder orqali huquqiy so‘rov
                  bilan olinadi.
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  Xarita
                </Typography>
                <MapPreview intel={intel} />
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={1.25}>
              {[
                ['Jami urinishlar', number(data.summary?.total)],
                ['Yuqori xavfli', number(data.summary?.high)],
                ['To‘xtatilgan', number(data.summary?.prevented)],
                ['Birinchi ko‘rilgan', time(data.summary?.first_seen)],
                ['Oxirgi faollik', relativeTime(data.summary?.last_seen)]
              ].map(([label, value]) => (
                <Grid item xs={6} sm={4} md={2.4} key={label}>
                  <Fact label={label} value={value} />
                </Grid>
              ))}
            </Grid>

            {data.claims.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Yuborilgan IP sarlavhalari
                </Typography>
                <Alert severity={data.summary?.spoof ? 'error' : 'info'} sx={{ mb: 1.5 }}>
                  {data.summary?.spoof
                    ? `Bu manba so‘rov sarlavhalarida boshqa IP manzillarni yozib, o‘zini yashirmoqchi bo‘lgan. Tizim aldanmaydi: haqiqiy ulanish manzili — ${ip}.`
                    : 'Sarlavhalar ishonchli proksi orqali kelgan yoki haqiqiy IP bilan mos.'}
                </Alert>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sarlavha qiymati</TableCell>
                      <TableCell>Holat</TableCell>
                      <TableCell>Soni</TableCell>
                      <TableCell>Oxirgi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.claims.map((row) => (
                      <TableRow key={row.forwarded_claims}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, overflowWrap: 'anywhere' }}>
                          {row.forwarded_claims}
                        </TableCell>
                        <TableCell>
                          {row.spoof ? <Chip size="small" color="error" label="Soxta" /> : <Chip size="small" label="Mos" />}
                        </TableCell>
                        <TableCell>{number(row.total)}</TableCell>
                        <TableCell>{time(row.last_seen)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={5}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Hujum turlari
                </Typography>
                <Stack spacing={0.75}>
                  {data.types.map((row) => (
                    <Stack key={`${row.event_type}-${row.severity}`} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" color={severityColors[row.severity] || 'default'} label={row.severity} />
                        <Typography variant="body2">{typeLabels[row.event_type] || row.event_type}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight={600}>
                        {number(row.total)}
                      </Typography>
                    </Stack>
                  ))}
                  {!data.types.length && <Typography color="text.secondary">Hodisalar yo‘q.</Typography>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Qurilma va dasturlar
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Aniqlangan</TableCell>
                      <TableCell>User-Agent (mijoz yuborgan)</TableCell>
                      <TableCell>Soni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.agents.map((row) => (
                      <TableRow key={row.user_agent || 'empty'}>
                        <TableCell>
                          <ClientInfo client={row.client} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, maxWidth: 320, overflowWrap: 'anywhere', color: 'text.secondary' }}>
                          {row.user_agent || '—'}
                        </TableCell>
                        <TableCell>{number(row.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="h5" sx={{ mb: 1 }}>
                So‘ralgan manzillar
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>So‘rov</TableCell>
                    <TableCell>HTTP</TableCell>
                    <TableCell>Soni</TableCell>
                    <TableCell>Oxirgi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.paths.map((row) => (
                    <TableRow key={`${row.method}-${row.path}-${row.status_code}`}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, overflowWrap: 'anywhere' }}>
                        {row.method} {row.path}
                      </TableCell>
                      <TableCell>{row.status_code}</TableCell>
                      <TableCell>{number(row.total)}</TableCell>
                      <TableCell>{time(row.last_seen)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {data.public && (
              <Box>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Tashqi bazalarda tekshirish
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {[
                    ['AbuseIPDB', `https://www.abuseipdb.com/check/${ip}`],
                    ['VirusTotal', `https://www.virustotal.com/gui/ip-address/${ip}`],
                    ['Shodan', `https://www.shodan.io/host/${ip}`],
                    ['GreyNoise', `https://viz.greynoise.io/ip/${ip}`],
                    ['WHOIS / BGP', `https://bgp.he.net/ip/${ip}`]
                  ].map(([label, href]) => (
                    <Button key={label} size="small" variant="outlined" href={href} target="_blank" rel="noopener noreferrer">
                      {label}
                    </Button>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  WHOIS ma’lumotida provayderning abuse (shikoyat) manzili bo‘ladi — hujum haqida shu manzilga xabar berish mumkin.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        {data?.public && (
          <Button startIcon={<ReloadOutlined />} onClick={refreshIntel} disabled={isValidating}>
            Ma’lumotni yangilash
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        {data?.block ? (
          <Button onClick={() => onUnblock(ip)}>Blokni ochish</Button>
        ) : (
          <Button
            color="error"
            variant="contained"
            startIcon={<StopOutlined />}
            disabled={!data || ip === currentIp}
            onClick={() => onBlock(ip)}
          >
            Bloklash
          </Button>
        )}
        <Button onClick={onClose}>Yopish</Button>
      </DialogActions>
    </Dialog>
  );
}

IpDossierDialog.propTypes = {
  ip: PropTypes.string,
  typeLabels: PropTypes.object,
  currentIp: PropTypes.string,
  onClose: PropTypes.func,
  onBlock: PropTypes.func,
  onUnblock: PropTypes.func
};
