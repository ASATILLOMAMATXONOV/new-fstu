import React, { useEffect, useMemo, useState } from 'react';
import '../assets/styles/PartnersPage.css';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getTranslatedField } from '../utils/cms';

// Production'da ushbu JSONni public/maps/countries.geo.json ga saqlab,
// quyidagi manzilni '/maps/countries.geo.json' ga almashtirish tavsiya etiladi.
const GEOJSON_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

const LABELS = {
  uz: { heading: 'Xalqaro hamkorlik geografiyasi', eyebrow: 'XALQARO HAMKORLAR', search: 'Universitet yoki davlatni qidirish...', all: 'Barcha davlatlar', chosen: 'Tanlangan davlat', result: 'Hamkor universitetlar', count: 'hamkor', none: 'Bu davlatda hamkor universitet ko‘rsatilmagan', unavailable: 'Rasmiy sayt ko‘rsatilmagan', official: 'Rasmiy sayt', address: 'Manzil', maps: 'Xaritada ochish', unknown: 'Davlat ko‘rsatilmagan', noAddress: 'Manzil ko‘rsatilmagan', loading: 'Xarita yuklanmoqda...', error: 'Xaritani yuklashda xatolik. Internetni yoki GeoJSON manzilini tekshiring.', reset: 'Barchasi', empty: 'Hamkorlar topilmadi' },
  ru: { heading: 'География международного сотрудничества', eyebrow: 'МЕЖДУНАРОДНЫЕ ПАРТНЁРЫ', search: 'Поиск университета или страны...', all: 'Все страны', chosen: 'Выбранная страна', result: 'Университеты-партнёры', count: 'партнёров', none: 'В этой стране партнёры не указаны', unavailable: 'Официальный сайт не указан', official: 'Официальный сайт', address: 'Адрес', maps: 'Открыть на карте', unknown: 'Страна не указана', noAddress: 'Адрес не указан', loading: 'Загрузка карты...', error: 'Ошибка загрузки карты. Проверьте доступ к GeoJSON.', reset: 'Все', empty: 'Партнёры не найдены' },
  en: { heading: 'Global partnership geography', eyebrow: 'INTERNATIONAL PARTNERS', search: 'Search university or country...', all: 'All countries', chosen: 'Selected country', result: 'Partner universities', count: 'partners', none: 'No partner universities listed for this country', unavailable: 'Official website not provided', official: 'Official website', address: 'Address', maps: 'Open in maps', unknown: 'Country not specified', noAddress: 'Address not provided', loading: 'Loading map...', error: 'Unable to load the map. Check GeoJSON access.', reset: 'All', empty: 'No partners found' }
};

const ALIASES = {
  uz:'uzbekistan',uzb:'uzbekistan',ozbekiston:'uzbekistan',uzbekiston:'uzbekistan',
  cn:'china',chn:'china',xitoy:'china', de:'germany',deu:'germany',germaniya:'germany',
  kr:'southkorea',kor:'southkorea',republicofkorea:'southkorea',korearepublicof:'southkorea',janubiykoreya:'southkorea',
  ru:'russia',rus:'russia',russianfederation:'russia',rossiya:'russia',
  us:'unitedstates',usa:'unitedstates',unitedstatesofamerica:'unitedstates',aqsh:'unitedstates',
  gb:'unitedkingdom',gbr:'unitedkingdom',greatbritain:'unitedkingdom',buyukbritaniya:'unitedkingdom',
  tr:'turkey',tur:'turkey',turkiye:'turkey',turkiya:'turkey',
  kz:'kazakhstan',kaz:'kazakhstan',qozogiston:'kazakhstan',
  kg:'kyrgyzstan',kgz:'kyrgyzstan',qirgiziston:'kyrgyzstan',
  tj:'tajikistan',tjk:'tajikistan',tojikiston:'tajikistan',
  pl:'poland',pol:'poland',polsha:'poland', hu:'hungary',hun:'hungary',vengriya:'hungary',
  it:'italy',ita:'italy',italiya:'italy',fr:'france',fra:'france',fransiya:'france',
  jp:'japan',jpn:'japan',yaponiya:'japan',in:'india',ind:'india',hindiston:'india',
  pk:'pakistan',pak:'pakistan',my:'malaysia',mys:'malaysia',malayziya:'malaysia',
  id:'indonesia',idn:'indonesia',indoneziya:'indonesia',
  lv:'latvia',lva:'latvia',latviya:'latvia',at:'austria',aut:'austria',avstriya:'austria',
  sk:'slovakia',svk:'slovakia',slovakiya:'slovakia',cz:'czechia',cze:'czechia',czechrepublic:'czechia',chexiya:'czechia',
  es:'spain',esp:'spain',ispaniya:'spain',ca:'canada',can:'canada',kanada:'canada',
  au:'australia',aus:'australia',avstraliya:'australia',br:'brazil',bra:'brazil',braziliya:'brazil',
  eg:'egypt',egy:'egypt',misr:'egypt',sa:'saudiarabia',sau:'saudiarabia',saudiyaarabistoni:'saudiarabia',
  unitedrepublicoftanzania:'tanzania',democraticrepublicofthecongo:'democraticrepublicofthecongo'
};

function countryKey(value) {
  const key = String(value || '').normalize('NFKD').toLowerCase()
    .replace(/[ʻ‘’'`]/g, '').replace(/[^a-z0-9]/g, '');
  return ALIASES[key] || key;
}
function countryOf(p) {
  const val = p.countryCode ?? p.country_code ?? p.countryName ?? p.country_name ?? p.country ?? p.location?.country ?? '';
  return typeof val === 'object' && val !== null ? String(val.code ?? val.name ?? val.title ?? '') : String(val || '');
}
function addressOf(p) {
  const val = p.address ?? p.address_uz ?? p.location?.address ?? p.fullAddress ?? p.full_address ?? p.universityAddress ?? p.university_address ?? '';
  if (typeof val === 'object' && val !== null) return String(val.formatted ?? val.name ?? val.title ?? '');
  return String(val || '').trim();
}
function safeUrl(value) {
  try { const url = new URL(String(value || '').trim()); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
}
function Icon({name, size=18}) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    arrow: <path d="M7 17 17 7M8 7h9v9"/>,
    close: <path d="M18 6 6 18M6 6l12 12"/>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

// Anti-meridian (±180°) chizig‘ini kesib o‘tadigan segmentlarni uzamiz.
// Shunda skrinshotdagi dunyo ustidan o‘tuvchi noto‘g‘ri katta to‘rtburchak yo‘qoladi.
function ringPath(ring) {
  let parts = [], current = [], previousX = null;
  function finish() {
    if (current.length >= 3) parts.push(current.map(([x,y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z');
    current = [];
  }
  for (const point of ring || []) {
    const lon = Number(point[0]), lat = Number(point[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const x = (lon + 180) / 360 * 1000, y = (90 - lat) / 180 * 500;
    if (previousX !== null && Math.abs(x - previousX) > 500) finish();
    current.push([x,y]); previousX = x;
  }
  finish();
  return parts.join(' ');
}
function geometryPath(geometry) {
  if (!geometry?.coordinates) return '';
  if (geometry.type === 'Polygon') return geometry.coordinates.map(ringPath).join(' ');
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flatMap(poly => poly.map(ringPath)).join(' ');
  return '';
}

function WorldMap({ countries, selected, onSelect, labels }) {
  const [features, setFeatures] = useState([]);
  const [status, setStatus] = useState('loading');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setStatus('loading');
        const response = await fetch(GEOJSON_URL, {signal: controller.signal});
        if (!response.ok) throw new Error('GeoJSON request failed');
        const data = await response.json();
        if (!Array.isArray(data.features)) throw new Error('Invalid GeoJSON');
        if (!controller.signal.aborted) { setFeatures(data.features); setStatus('ready'); }
      } catch (error) {
        if (!controller.signal.aborted) setStatus('error');
      }
    })();
    return () => controller.abort();
  }, []);

  const counts = useMemo(() => new Map(countries.map(c => [c.key, c])), [countries]);
  const active = hovered || countries.find(c => c.key === selected);

  return <div className="pp-map-card">
    <div className="pp-map-head">
      <div><span className="pp-eyebrow"><Icon name="globe" size={15}/>{labels.eyebrow}</span><h1>{labels.heading}</h1><div className="pp-map-statline"><span className="pp-map-stat"><strong>{countries.length}</strong> {labels.all}</span><span className="pp-map-stat"><strong>{countries.reduce((n,c) => n+c.count,0)}</strong> {labels.result}</span></div></div>
      {selected && <button type="button" className="pp-reset" onClick={() => onSelect('')}><Icon name="close" size={15}/>{labels.reset}</button>}
    </div>
    {status !== 'ready' ? <div className="pp-map-message">{status === 'loading' ? labels.loading : labels.error}</div> :
      <div className="pp-map-stage">
        <svg viewBox="0 0 1000 500" className="pp-world" aria-label={labels.heading} role="group">
          <defs><pattern id="pp-map-lines" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#d9e6f4" strokeWidth=".7"/></pattern></defs>
          <rect width="1000" height="500" fill="url(#pp-map-lines)"/>
          {features.map((feature, i) => {
            const name = feature.properties?.name || '';
            const key = countryKey(name);
            const info = counts.get(key);
            const activeCountry = selected === key;
            return <path
              key={feature.id ?? i}
              d={geometryPath(feature.geometry)}
              fillRule="evenodd"
              className={`pp-country ${info ? 'pp-country--partner' : ''} ${activeCountry ? 'pp-country--selected' : ''}`}
              role="button" tabIndex={0}
              aria-pressed={activeCountry}
              aria-label={`${name}: ${info?.count ?? 0} ${labels.count}`}
              onMouseEnter={() => setHovered({name, count:info?.count ?? 0})}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered({name, count:info?.count ?? 0})}
              onBlur={() => setHovered(null)}
              onClick={() => onSelect(key)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); onSelect(key);} }}
            />;
          })}
        </svg>
        <div className="pp-map-legend"><span><i className="pp-legend--partner"/>{labels.result}</span><span><i className="pp-legend--other"/>{labels.all}</span><span><i className="pp-legend--selected"/>{labels.chosen}</span></div>
        {active && <div className="pp-map-hint"><strong>{active.name}</strong><span>{active.count} {labels.count}</span></div>}
      </div>}
  </div>;
}

function PartnerLogo({ src, title }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  return src && !failed ? <img src={src} alt={title} loading="lazy" onError={() => setFailed(true)}/> : <span className="pp-logo-placeholder"><Icon name="globe" size={32}/></span>;
}

function PartnerCard({ partner, labels }) {
  const address = addressOf(partner);
  const url = safeUrl(partner.link);
  // Manzil bo‘lmasa xaritaga havola uydirilmaydi.
  const mapsUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
  return <article className="pp-partner-card">
    <div className="pp-logo"><PartnerLogo src={partner.image} title={partner.displayTitle}/></div>
    <div className="pp-partner-body">
      <span className="pp-partner-country"><Icon name="globe" size={13}/>{partner.countryLabel || labels.unknown}</span>
      <h3>{partner.displayTitle}</h3>
      <div className="pp-address"><Icon name="pin" size={17}/><div><small>{labels.address}</small><p>{address || labels.noAddress}</p>{mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{labels.maps} <Icon name="arrow" size={13}/></a>}</div></div>
      <div className="pp-card-foot">{url ? <a href={url} target="_blank" rel="noopener noreferrer">{labels.official}<Icon name="arrow" size={15}/></a> : <span>{labels.unavailable}</span>}</div>
    </div>
  </article>;
}

export default function PartnersPage() {
  const { currentLanguageCode } = useLanguage();
  const labels = LABELS[currentLanguageCode] || LABELS.uz;
  const {items: rawPartners = [], loading} = useContentList('partners', {revalidate:true});
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');

  const partners = useMemo(() => (Array.isArray(rawPartners) ? rawPartners.filter(Boolean) : []).map((p,i) => {
    const countryLabel = countryOf(p);
    return {...p, _key: String(p.id ?? i), displayTitle: getTranslatedField(p,'title',p.title || 'Partner'), countryLabel, countryKey:countryKey(countryLabel)};
  }), [rawPartners,currentLanguageCode]);

  const countries = useMemo(() => {
    const result = new Map();
    for (const p of partners) {
      if (!p.countryKey) continue;
      if (result.has(p.countryKey)) result.get(p.countryKey).count++;
      else result.set(p.countryKey, {key:p.countryKey,name:p.countryLabel,count:1});
    }
    return [...result.values()].sort((a,b) => a.name.localeCompare(b.name));
  }, [partners]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return partners.filter(p => (!selected || p.countryKey === selected) && (!query || `${p.displayTitle} ${p.countryLabel} ${addressOf(p)} ${p.link || ''}`.toLocaleLowerCase().includes(query)));
  }, [partners, search, selected]);
  const selectedInfo = countries.find(c => c.key === selected);

  return <main className="partners-page" id="xalqaro"><div className="pp-layout">
    <div className="pp-main">
      <WorldMap countries={countries} selected={selected} onSelect={setSelected} labels={labels}/>
      <div className="pp-filter-bar">
        <label className="pp-search"><Icon name="search" size={18}/><input type="search" value={search} placeholder={labels.search} onChange={e => setSearch(e.target.value)}/>{search && <button type="button" aria-label={labels.reset} onClick={() => setSearch('')}><Icon name="close" size={14}/></button>}</label>
        <select aria-label={labels.all} value={selected} onChange={e => setSelected(e.target.value)}><option value="">{labels.all}</option>{countries.map(c => <option key={c.key} value={c.key}>{c.name} ({c.count})</option>)}</select>
      </div>
      <section className="pp-results" aria-live="polite"><div className="pp-results-head"><div><span className="pp-eyebrow">{selected ? labels.chosen : labels.result}</span><h2>{selectedInfo?.name || labels.result}</h2></div><span className="pp-total">{filtered.length}</span></div>
        {loading ? <div className="pp-empty">{labels.loading}</div> : filtered.length ? <div className="pp-partner-grid">{filtered.map(p => <PartnerCard key={p._key} partner={p} labels={labels}/>)}</div> : <div className="pp-empty"><Icon name="globe" size={28}/>{selected ? labels.none : labels.empty}</div>}
      </section>
    </div>
    <aside className="pp-sidebar"><AcademicSidebar/></aside>
  </div></main>;
}
