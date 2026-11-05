import { promises as dns } from 'node:dns';
import { BlockList, isIP } from 'node:net';

import { query } from '../../db/pool.js';
import { normalizeIp, safeText } from './security-rules.js';

// IP intelligence for the security dashboard: geolocation, ISP/ASN, VPN/proxy/Tor/
// hosting classification, reverse DNS, forwarded-header spoofing and client tooling.
// Location is approximate (city / provider level). For VPN, proxy and Tor traffic the
// location belongs to the exit server, not to the person behind it.

const CACHE_DAYS = 7;
const LOOKUP_TIMEOUT_MS = 5000;
// The second source is used when the Tor Project site is unreachable (blocked in some regions).
const TOR_LIST_URLS = ['https://check.torproject.org/torbulkexitlist', 'https://www.dan.me.uk/torlist/?exit'];
const TOR_RETRY_MS = 10 * 60 * 1000;
const TOR_REFRESH_MS = 60 * 60 * 1000;
const FIELDS = 'status,message,query,country,countryCode,regionName,city,district,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting';

const lookupEnabled = !/^(0|false|off|no)$/i.test(String(process.env.SECURITY_IP_INTEL || 'on').trim());
const apiKey = String(process.env.IP_API_KEY || '').trim();

const reserved = new BlockList();
for (const [network, prefix] of [['10.0.0.0', 8], ['172.16.0.0', 12], ['192.168.0.0', 16], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['100.64.0.0', 10], ['0.0.0.0', 8], ['224.0.0.0', 4], ['240.0.0.0', 4]]) {
  reserved.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [['::1', 128], ['fc00::', 7], ['fe80::', 10], ['::', 128], ['ff00::', 8]]) {
  reserved.addSubnet(network, prefix, 'ipv6');
}

export function isPublicIp(ip) {
  const version = isIP(ip);
  return Boolean(version) && !reserved.check(ip, version === 6 ? 'ipv6' : 'ipv4');
}

/* ---------------- Tor exit nodes ---------------- */

let torExits = new Set();
let torFetchedAt = 0;
let torPending = null;

async function refreshTorExits() {
  const maxAge = torExits.size ? TOR_REFRESH_MS : TOR_RETRY_MS;
  if (Date.now() - torFetchedAt < maxAge) return torExits;
  if (!torPending) {
    torPending = (async () => {
      for (const url of TOR_LIST_URLS) {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) });
          if (!response.ok) continue;
          const next = new Set((await response.text()).split(/\s+/).map(normalizeIp).filter(Boolean));
          if (next.size > 100) {
            torExits = next;
            return;
          }
        } catch {
          // Try the next source.
        }
      }
    })().finally(() => {
      torFetchedAt = Date.now();
      torPending = null;
    });
  }
  await torPending;
  return torExits;
}

/* ---------------- Geolocation provider (ip-api.com) ---------------- */

function providerUrl(path) {
  return apiKey ? `https://pro.ip-api.com${path}${path.includes('?') ? '&' : '?'}key=${encodeURIComponent(apiKey)}`
    : `http://ip-api.com${path}`;
}

function mapProvider(row) {
  if (!row || row.status !== 'success') return null;
  const asMatch = String(row.as || '').match(/^AS(\d+)/i);
  return {
    country: safeText(row.country, 80),
    countryCode: safeText(row.countryCode, 2).toUpperCase(),
    region: safeText(row.regionName, 80),
    city: safeText(row.city, 80),
    district: safeText(row.district, 80),
    zip: safeText(row.zip, 20),
    lat: Number.isFinite(row.lat) ? row.lat : null,
    lon: Number.isFinite(row.lon) ? row.lon : null,
    timezone: safeText(row.timezone, 60),
    isp: safeText(row.isp, 120),
    org: safeText(row.org, 120),
    asn: asMatch ? Number(asMatch[1]) : null,
    asName: safeText(row.asname || row.as, 120),
    reverseDns: safeText(row.reverse, 200),
    mobile: Boolean(row.mobile),
    proxy: Boolean(row.proxy),
    hosting: Boolean(row.hosting)
  };
}

async function fetchProviderBatch(ips) {
  const response = await fetch(providerUrl(`/batch?fields=${FIELDS}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ips),
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`IP lookup failed: ${response.status}`);
  const rows = await response.json();
  return new Map((Array.isArray(rows) ? rows : []).map((row) => [normalizeIp(row?.query), mapProvider(row)]));
}

async function reverseDns(ip) {
  try {
    const names = await Promise.race([
      dns.reverse(ip),
      new Promise((_, reject) => { setTimeout(() => reject(new Error('timeout')), 1500); })
    ]);
    return safeText(names?.[0], 200);
  } catch {
    return '';
  }
}

/* ---------------- Classification ---------------- */

const VPN_HINTS = /(vpn|proxy|\bnord|express ?vpn|surfshark|proton|mullvad|private internet access|cyberghost|windscribe|hide\.?me|ipvanish|torguard|purevpn|hotspot shield|psiphon|tunnel)\b/i;
const HOSTING_HINTS = /\b(amazon|aws|google cloud|microsoft|azure|digitalocean|linode|akamai|vultr|ovh|hetzner|contabo|choopa|leaseweb|alibaba|tencent|oracle cloud|scaleway|m247|datacamp|cdn77|g-core|hostinger|ionos|selectel|timeweb|aeza)\b/i;

export function classifyNetwork(intel, { tor = false } = {}) {
  if (!intel) return { type: 'unknown', label: 'Noma’lum', risk: 'unknown', note: 'Tarmoq ma’lumoti hali aniqlanmagan.' };
  if (intel.private) return { type: 'private', label: 'Ichki tarmoq', risk: 'low', note: 'Lokal yoki ichki tarmoq manzili (proksi/serverning o‘zi bo‘lishi mumkin).' };
  const provider = `${intel.isp} ${intel.org} ${intel.asName} ${intel.reverseDns}`;
  if (tor || (intel.proxy && /\btor\b|tor-?exit|torservers/i.test(provider))) {
    return { type: 'tor', label: 'Tor', risk: 'high',
      note: 'Tor chiqish tuguni. Haqiqiy manzil Tor tarmog‘i ortida yashiringan; ko‘rsatilgan joy — tugun serveri.' };
  }
  if (intel.proxy || VPN_HINTS.test(provider)) {
    return { type: 'vpn', label: 'VPN / Proxy', risk: 'high',
      note: 'VPN yoki proksi orqali ulangan. Ko‘rsatilgan joy — VPN serveri; hujumchining haqiqiy manzili emas.' };
  }
  if (intel.hosting || HOSTING_HINTS.test(provider)) {
    return { type: 'hosting', label: 'Server / Hosting', risk: 'medium',
      note: 'Data-markaz (VPS, bulut) manzili. Ko‘pincha avtomatik skanerlar, botlar yoki shaxsiy VPN shu yerdan ishlaydi.' };
  }
  if (intel.mobile) {
    return { type: 'mobile', label: 'Mobil aloqa', risk: 'low',
      note: 'Mobil operator tarmog‘i. Bir IP ortida ko‘plab abonentlar bo‘lishi mumkin (CGNAT).' };
  }
  return { type: 'residential', label: 'Uy / ofis interneti', risk: 'low',
    note: 'Oddiy provayder manzili. Joylashuv shahar darajasida taxminiy; aniq manzilni faqat provayder rasmiy so‘rov bo‘yicha bera oladi.' };
}

/* ---------------- Public API ---------------- */

async function readCache(ips) {
  if (!ips.length) return new Map();
  const result = await query(
    `SELECT host(ip) AS ip, data, fetched_at FROM security_ip_intel
      WHERE ip = ANY($1::inet[]) AND fetched_at > NOW() - $2 * INTERVAL '1 day'`,
    [ips, CACHE_DAYS]
  );
  return new Map(result.rows.map((row) => [row.ip, { ...row.data, fetchedAt: row.fetched_at }]));
}

async function writeCache(ip, data) {
  await query(
    `INSERT INTO security_ip_intel (ip, data, fetched_at) VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (ip) DO UPDATE SET data = EXCLUDED.data, fetched_at = NOW()`,
    [ip, JSON.stringify(data)]
  );
}

const inflight = new Map();

/**
 * Returns intel for each IP (cached for 7 days). Missing entries are looked up
 * in one batch request; failures simply leave the IP without intel.
 */
export async function lookupIps(rawIps = [], { refresh = false } = {}) {
  const ips = [...new Set(rawIps.map(normalizeIp).filter(Boolean))].slice(0, 100);
  const result = new Map();
  const [tor, cached] = await Promise.all([refreshTorExits(), refresh ? new Map() : readCache(ips).catch(() => new Map())]);

  const missing = [];
  for (const ip of ips) {
    if (!isPublicIp(ip)) result.set(ip, { private: true });
    else if (cached.has(ip)) result.set(ip, cached.get(ip));
    else missing.push(ip);
  }

  if (missing.length && lookupEnabled) {
    const key = missing.join(',');
    if (!inflight.has(key)) {
      inflight.set(key, (async () => {
        const provider = await fetchProviderBatch(missing).catch(() => new Map());
        await Promise.all(missing.map(async (ip) => {
          const data = provider.get(ip);
          if (!data) return;
          if (!data.reverseDns) data.reverseDns = await reverseDns(ip);
          result.set(ip, data);
          await writeCache(ip, data).catch(() => {});
        }));
      })().finally(() => inflight.delete(key)));
    }
    await inflight.get(key);
  }

  for (const ip of ips) {
    const intel = result.get(ip) || null;
    const isTor = tor.has(ip);
    result.set(ip, { ip, ...(intel || {}), tor: isTor, network: classifyNetwork(intel, { tor: isTor }) });
  }
  return result;
}

export const intelStatus = () => ({ enabled: lookupEnabled, provider: lookupEnabled ? (apiKey ? 'ip-api.com (pro)' : 'ip-api.com') : null,
  torExitNodes: torExits.size, torUpdatedAt: torFetchedAt ? new Date(torFetchedAt).toISOString() : null });

/* ---------------- Forwarded header spoofing ---------------- */

const FORWARD_HEADERS = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'true-client-ip', 'x-client-ip', 'forwarded', 'via'];

/**
 * Collects client-supplied forwarding headers. Any address there that is neither the
 * real connection IP nor a trusted proxy was injected to disguise the source.
 */
export function inspectForwarding(req, realIp) {
  const headers = req.headers || {};
  const parts = [];
  const claimed = [];
  for (const name of FORWARD_HEADERS) {
    const value = headers[name];
    if (!value) continue;
    const text = safeText(Array.isArray(value) ? value.join(', ') : value, 160);
    parts.push(`${name}: ${text}`);
    if (name === 'via') continue;
    const tokens = name === 'forwarded'
      ? [...text.matchAll(/for="?\[?([^\]";,\s]+)/gi)].map((match) => match[1])
      : text.split(',');
    for (const token of tokens) {
      const ip = normalizeIp(String(token).trim().replace(/^\[|\](:\d+)?$/g, '').replace(/^(\d+\.\d+\.\d+\.\d+):\d+$/, '$1'));
      if (ip) claimed.push(ip);
    }
  }

  const trust = typeof req.app?.get === 'function' ? req.app.get('trust proxy fn') : null;
  const isTrusted = (ip) => {
    try { return Boolean(trust?.(ip, 0)); } catch { return false; }
  };
  const fake = [...new Set(claimed)].filter((ip) => ip !== realIp && !isTrusted(ip));

  return {
    claims: safeText(parts.join(' | '), 300),
    claimedIps: [...new Set(claimed)],
    fakeIps: fake,
    spoofAttempt: fake.length > 0
  };
}

/* ---------------- User agent / tooling ---------------- */

const TOOLS = [
  [/sqlmap/i, 'sqlmap', 'SQL-injeksiya skaneri'], [/nikto/i, 'Nikto', 'Veb-zaiflik skaneri'],
  [/nmap/i, 'Nmap', 'Port/servis skaneri'], [/masscan/i, 'Masscan', 'Ommaviy port skaneri'],
  [/zgrab/i, 'ZGrab', 'Internet skaneri'], [/nuclei/i, 'Nuclei', 'Zaiflik skaneri'],
  [/(wpscan)/i, 'WPScan', 'WordPress skaneri'], [/(dirbuster|gobuster|ffuf|feroxbuster|dirb)/i, 'Fuzzer', 'Katalog/fayl qidiruvchi'],
  [/(acunetix|netsparker|burp|zap\/|owasp)/i, 'Pentest vositasi', 'Professional skaner'],
  [/hydra/i, 'Hydra', 'Parol tanlash vositasi'], [/(censys|shodan|expanse|internet-measurement|criminalip)/i, 'Internet skaneri', 'Ommaviy skanerlash xizmati'],
  [/curl\//i, 'curl', 'Buyruq qatori'], [/wget/i, 'Wget', 'Buyruq qatori'],
  [/python-requests|python-urllib|aiohttp|httpx/i, 'Python skript', 'Avtomatlashtirilgan skript'],
  [/go-http-client/i, 'Go skript', 'Avtomatlashtirilgan skript'], [/node-fetch|axios|undici/i, 'Node.js skript', 'Avtomatlashtirilgan skript'],
  [/(java\/|okhttp|apache-httpclient)/i, 'Java klient', 'Avtomatlashtirilgan skript'], [/postman/i, 'Postman', 'API sinov vositasi'],
  [/powershell/i, 'PowerShell', 'Buyruq qatori'],
  [/(googlebot|bingbot|yandex(bot)?|duckduckbot|baiduspider|applebot)/i, 'Qidiruv boti', 'Qidiruv tizimi roboti'],
  [/(bot|crawler|spider|scan)/i, 'Bot', 'Avtomatik dastur']
];

export function parseUserAgent(raw = '') {
  const ua = String(raw || '');
  if (!ua.trim()) return { browser: '—', os: '—', device: 'Noma’lum', tool: 'User-Agent yo‘q', toolNote: 'Odatda skript yoki skaner', automated: true };
  const tool = TOOLS.find(([pattern]) => pattern.test(ua));

  const os = /windows nt 10/i.test(ua) ? 'Windows 10/11' : /windows nt 6\.3/i.test(ua) ? 'Windows 8.1'
    : /windows nt 6\.1/i.test(ua) ? 'Windows 7' : /windows/i.test(ua) ? 'Windows'
      : /android ([\d.]+)/i.test(ua) ? `Android ${ua.match(/android ([\d.]+)/i)[1]}`
        : /(iphone|ipad).*os ([\d_]+)/i.test(ua) ? `iOS ${ua.match(/os ([\d_]+)/i)[1].replace(/_/g, '.')}`
          : /mac os x ([\d_]+)/i.test(ua) ? `macOS ${ua.match(/mac os x ([\d_]+)/i)[1].replace(/_/g, '.')}`
            : /cros/i.test(ua) ? 'ChromeOS' : /linux/i.test(ua) ? 'Linux' : '—';

  const pick = (pattern, name) => { const match = ua.match(pattern); return match ? `${name} ${match[1].split('.')[0]}` : null; };
  const browser = pick(/edg(?:e|a|ios)?\/([\d.]+)/i, 'Edge') || pick(/opr\/([\d.]+)/i, 'Opera') || pick(/yabrowser\/([\d.]+)/i, 'Yandex')
    || pick(/samsungbrowser\/([\d.]+)/i, 'Samsung') || pick(/firefox\/([\d.]+)/i, 'Firefox') || pick(/chrome\/([\d.]+)/i, 'Chrome')
    || (/safari/i.test(ua) && pick(/version\/([\d.]+)/i, 'Safari')) || '—';

  const device = /ipad|tablet/i.test(ua) ? 'Planshet' : /mobi|iphone|android/i.test(ua) ? 'Telefon'
    : tool && !/qidiruv/i.test(tool[2]) ? 'Server / skript' : 'Kompyuter';

  return { browser, os, device, tool: tool ? tool[1] : null, toolNote: tool ? tool[2] : null, automated: Boolean(tool) };
}
