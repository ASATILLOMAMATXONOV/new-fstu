import PropTypes from 'prop-types';
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CopyOutlined, WarningFilled } from '@ant-design/icons';

export const NETWORK_COLORS = {
  tor: '#a855f7',
  vpn: '#f43f5e',
  hosting: '#fb923c',
  mobile: '#38bdf8',
  residential: '#34d399',
  private: '#94a3b8',
  unknown: '#9e9e9e'
};

// Shared dark "SOC console" palette used by the security pages.
export const soc = {
  bg: '#0a1222',
  panel: '#111a30',
  panelSoft: '#16213c',
  border: '#22314f',
  text: '#e6ecf7',
  sub: '#8aa0c6',
  accent: '#38bdf8',
  danger: '#f43f5e',
  warn: '#fb923c',
  ok: '#34d399',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace'
};

export const time = (value) =>
  value
    ? new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Tashkent' }).format(new Date(value))
    : '—';
export const number = (value) => Number(value || 0).toLocaleString('uz-UZ');

export function relativeTime(value) {
  if (!value) return '—';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 0)} soniya oldin`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} daqiqa oldin`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} soat oldin`;
  return `${Math.round(seconds / 86400)} kun oldin`;
}

export function Flag({ code, size = 20 }) {
  const normalized = String(code || '').toLowerCase();
  if (!/^[a-z]{2}$/.test(normalized)) {
    return (
      <Box component="span" sx={{ display: 'inline-block', width: size, textAlign: 'center' }}>
        🌐
      </Box>
    );
  }
  return (
    <Box
      component="img"
      src={`https://flagcdn.com/w40/${normalized}.png`}
      alt={normalized.toUpperCase()}
      loading="lazy"
      sx={{ width: size, height: Math.round(size * 0.75), objectFit: 'cover', borderRadius: '3px', boxShadow: 1, flexShrink: 0 }}
    />
  );
}
Flag.propTypes = { code: PropTypes.string, size: PropTypes.number };

export function NetworkChip({ intel, size = 'small' }) {
  const network = intel?.network || { type: 'unknown', label: 'Noma’lum', note: '' };
  const color = NETWORK_COLORS[network.type] || NETWORK_COLORS.unknown;
  return (
    <Tooltip title={network.note || ''} arrow>
      <Chip
        size={size}
        label={network.label}
        sx={{ fontWeight: 600, color, bgcolor: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.35)}` }}
      />
    </Tooltip>
  );
}
NetworkChip.propTypes = { intel: PropTypes.object, size: PropTypes.string };

export function ClientInfo({ client }) {
  if (!client) return <Typography variant="body2">—</Typography>;
  if (client.tool) {
    return (
      <Tooltip title={client.toolNote || ''} arrow>
        <Chip
          size="small"
          color={client.device === 'Server / skript' ? 'error' : 'default'}
          variant="outlined"
          label={`🛠 ${client.tool}`}
        />
      </Tooltip>
    );
  }
  return (
    <Box>
      <Typography variant="body2">{client.os}</Typography>
      <Typography variant="caption" color="text.secondary">
        {client.browser} · {client.device}
      </Typography>
    </Box>
  );
}
ClientInfo.propTypes = { client: PropTypes.object };

export function locationText(intel) {
  if (!intel) return 'Aniqlanmoqda…';
  if (intel.private) return 'Ichki tarmoq';
  return (
    [intel.city, intel.region, intel.country]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(', ') || 'Noma’lum'
  );
}

export function IpCell({ ip, intel, spoof, onOpen }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Flag code={intel?.countryCode} />
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography
            component={onOpen ? 'button' : 'span'}
            type={onOpen ? 'button' : undefined}
            onClick={onOpen}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              fontSize: 13,
              p: 0,
              border: 0,
              bgcolor: 'transparent',
              color: onOpen ? 'primary.main' : 'inherit',
              cursor: onOpen ? 'pointer' : 'default',
              '&:hover': onOpen ? { textDecoration: 'underline' } : undefined
            }}
          >
            {ip}
          </Typography>
          <Tooltip title="Nusxa olish">
            <IconButton
              size="small"
              aria-label={`${ip} manzilini nusxalash`}
              onClick={() => navigator.clipboard?.writeText(ip)}
              sx={{ p: 0.25 }}
            >
              <CopyOutlined style={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
          {spoof && (
            <Tooltip
              title="Bu manba sarlavhalarda soxta IP yuborgan (o‘zini boshqa manzil qilib ko‘rsatmoqchi bo‘lgan). Ko‘rsatilgan IP — haqiqiy ulanish manzili."
              arrow
            >
              <WarningFilled style={{ color: '#e53935', fontSize: 14 }} />
            </Tooltip>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ maxWidth: 220 }}>
          {locationText(intel)}
        </Typography>
      </Box>
    </Stack>
  );
}
IpCell.propTypes = { ip: PropTypes.string, intel: PropTypes.object, spoof: PropTypes.bool, onOpen: PropTypes.func };

export function KpiCard({ title, value, icon, color, hint, dark }) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: 2.25,
        borderRadius: 2,
        height: '100%',
        bgcolor: dark ? soc.panel : 'background.paper',
        border: '1px solid',
        borderColor: dark ? soc.border : 'divider',
        transition: 'transform .2s, box-shadow .2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: dark ? `0 6px 20px ${alpha(color, 0.25)}` : 4 }
      }}
    >
      <Box sx={{ position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: color }} />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box>
          <Typography variant="body2" sx={{ color: dark ? soc.sub : 'text.secondary' }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.75, color, fontWeight: 700 }}>
            {number(value)}
          </Typography>
          {hint && (
            <Typography variant="caption" sx={{ color: dark ? soc.sub : 'text.secondary' }}>
              {hint}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            color,
            bgcolor: alpha(color, 0.12),
            fontSize: 20
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}
KpiCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.any,
  icon: PropTypes.node,
  color: PropTypes.string,
  hint: PropTypes.string,
  dark: PropTypes.bool
};

export function BarList({ items, renderLabel, color = 'primary.main' }) {
  const max = Math.max(1, ...items.map((item) => item.total));
  return (
    <Stack spacing={1.25}>
      {items.map((item) => (
        <Box key={item.key}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Box sx={{ minWidth: 0 }}>{renderLabel(item)}</Box>
            <Typography variant="body2" fontWeight={600}>
              {number(item.total)}
            </Typography>
          </Stack>
          <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${(item.total / max) * 100}%`,
                bgcolor: typeof color === 'function' ? color(item) : color,
                borderRadius: 3
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
BarList.propTypes = { items: PropTypes.array, renderLabel: PropTypes.func, color: PropTypes.oneOfType([PropTypes.string, PropTypes.func]) };
