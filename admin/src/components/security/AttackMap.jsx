import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';

import { NETWORK_COLORS, number, relativeTime } from './SecurityWidgets';

// Self-contained world threat map: an equirectangular projection of a lightweight
// country GeoJSON with animated attack-source markers and arcs toward the server.
// No external tiles or map libraries, so it works offline and under a strict CSP.

const W = 1000;
const H = 500;
const HOME = { lon: 71.7843, lat: 40.3842, label: 'FSTU serveri (Farg‘ona)' };

const project = (lon, lat) => [((Number(lon) + 180) / 360) * W, ((90 - Number(lat)) / 180) * H];

function ringToPoints(ring) {
  const step = ring.length > 80 ? Math.ceil(ring.length / 80) : 1;
  const points = [];
  for (let i = 0; i < ring.length; i += step) {
    const [x, y] = project(ring[i][0], ring[i][1]);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(' ');
}

function featurePolygons(feature) {
  const { type, coordinates } = feature.geometry || {};
  if (type === 'Polygon') return coordinates.map(ringToPoints);
  if (type === 'MultiPolygon') return coordinates.flat().map(ringToPoints);
  return [];
}

export default function AttackMap({ sources = [] }) {
  const [polygons, setPolygons] = useState([]);
  const [failed, setFailed] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const base = import.meta.env.BASE_URL || '/';
    fetch(`${base}maps/countries.geo.json`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('map'))))
      .then((data) => setPolygons((data.features || []).flatMap(featurePolygons)))
      .catch(() => setFailed(true));
  }, []);

  const [homeX, homeY] = project(HOME.lon, HOME.lat);

  const markers = useMemo(() => {
    const max = Math.max(1, ...sources.map((s) => Number(s.attempts || 1)));
    return sources
      .filter((s) => Number.isFinite(s.intel?.lat) && Number.isFinite(s.intel?.lon))
      .map((s) => {
        const [x, y] = project(s.intel.lon, s.intel.lat);
        const attempts = Number(s.attempts || 1);
        const radius = 3 + (Math.log(attempts + 1) / Math.log(max + 1)) * 9;
        const color = NETWORK_COLORS[s.intel?.network?.type] || NETWORK_COLORS.unknown;
        return { ...s, x, y, radius, color, attempts };
      });
  }, [sources]);

  const located = markers.length;
  const unlocated = sources.length - located;

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #22314f',
          background: 'radial-gradient(120% 120% at 50% 0%, #10203e 0%, #0a1222 70%)'
        }}
      >
        <Box
          component="svg"
          viewBox={`0 0 ${W} ${H}`}
          sx={{ width: '100%', display: 'block' }}
          role="img"
          aria-label="Hujum manbalari xaritasi"
        >
          <defs>
            <radialGradient id="atkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="atkArc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* faint lat/long grid */}
          <g stroke="#1b2b4a" strokeWidth="0.4">
            {[...Array(11)].map((_, i) => (
              <line key={`v${i}`} x1={(i * W) / 10} y1="0" x2={(i * W) / 10} y2={H} />
            ))}
            {[...Array(7)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={(i * H) / 6} x2={W} y2={(i * H) / 6} />
            ))}
          </g>

          {/* continents */}
          <g fill="#17284a" stroke="#2b3f6b" strokeWidth="0.5" strokeLinejoin="round">
            {polygons.map((points, index) => (
              <polygon key={index} points={points} />
            ))}
          </g>

          {/* attack arcs */}
          <g fill="none" stroke="url(#atkArc)" strokeWidth="1">
            {markers.map((m) => {
              const mx = (m.x + homeX) / 2;
              const lift = Math.min(120, Math.hypot(m.x - homeX, m.y - homeY) * 0.35);
              return (
                <path key={`arc-${m.ip}`} d={`M ${m.x} ${m.y} Q ${mx} ${Math.min(m.y, homeY) - lift} ${homeX} ${homeY}`} opacity="0.55" />
              );
            })}
          </g>

          {/* home server */}
          <g>
            <circle cx={homeX} cy={homeY} r="14" fill="url(#atkGlow)" />
            <circle cx={homeX} cy={homeY} r="4" fill="#38bdf8">
              <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* attack sources */}
          {markers.map((m) => (
            <Tooltip
              key={m.ip}
              arrow
              title={
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {m.ip}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {[m.intel?.city, m.intel?.country].filter(Boolean).join(', ')}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {m.intel?.network?.label} · {number(m.attempts)} urinish · {relativeTime(m.last_seen)}
                  </Typography>
                </Box>
              }
            >
              <g style={{ cursor: 'pointer' }}>
                <circle cx={m.x} cy={m.y} r={m.radius + 6} fill={m.color} opacity="0.15">
                  <animate attributeName="r" values={`${m.radius};${m.radius + 10};${m.radius}`} dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={m.x} cy={m.y} r={m.radius} fill={m.color} stroke="#0a1222" strokeWidth="0.8" />
              </g>
            </Tooltip>
          ))}
        </Box>

        {failed && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#8aa0c6' }}>
              Xarita fayli yuklanmadi.
            </Typography>
          </Box>
        )}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{
            position: 'absolute',
            left: 12,
            bottom: 12,
            p: 1,
            borderRadius: 1.5,
            bgcolor: 'rgba(10,18,34,0.7)',
            backdropFilter: 'blur(4px)'
          }}
        >
          {[
            ['tor', 'Tor'],
            ['vpn', 'VPN/Proxy'],
            ['hosting', 'Hosting'],
            ['residential', 'Oddiy'],
            ['mobile', 'Mobil']
          ].map(([key, label]) => (
            <Stack key={key} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: NETWORK_COLORS[key] }} />
              <Typography variant="caption" sx={{ color: '#aebdd8' }}>
                {label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
        <Chip size="small" label={`${number(located)} ta manba xaritada`} sx={{ bgcolor: 'rgba(56,189,248,0.12)', color: '#38bdf8' }} />
        {unlocated > 0 && <Chip size="small" label={`${number(unlocated)} ta joylashuvsiz`} variant="outlined" />}
        <Typography variant="caption" sx={{ color: '#8aa0c6' }}>
          Joylashuv shahar/provayder darajasida taxminiy. VPN/Tor bo‘lsa — nuqta VPN serverini ko‘rsatadi, hujumchining uyini emas.
        </Typography>
      </Stack>
    </Box>
  );
}

AttackMap.propTypes = { sources: PropTypes.array };
