import React, { useEffect, useMemo, useState } from 'react';
import '../assets/styles/PartnersPage.css';
import AcademicSidebar from '../components/layout/AcademicSidebar';
import { useLanguage } from '../context/LanguageContext';
import { useContentList } from '../hooks/useContentList';
import { getTranslatedField } from '../utils/cms';

// No extra map libraries: GeoJSON -> responsive SVG, rendered directly by React.
const GEO_URL = '/maps/countries.geo.json';
const W = 1000;
const H = 510;
const UI = {
  uz: { kicker:'FSTU / GLOBAL CONNECTIONS', title:'Hamkorlik chegaralarni bilmaydi', subtitle:'Dunyo xaritasidagi mamlakatni tanlang va hamkor universitetlarni kashf eting.', countries:'Hamkor davlatlar', universities:'Hamkor universitetlar', explore:'EXPLORE COUNTRIES', directory:'Universitetlar katalogi', all:'Barcha davlatlar', search:'Universitet yoki davlat nomi...', website:'Rasmiy veb-sayt', location:'Manzil', google:'Xaritada ko‘rish', none:'Bu davlat uchun hamkor universitetlar topilmadi.', empty:'Hamkor universitetlar topilmadi.', loading:'Xarita yuklanmoqda...', error:'GeoJSON yuklanmadi. public/maps/countries.geo.json manzilini tekshiring.', hint:'Davlatni tanlash uchun xaritani bosing', partner:'Hamkor davlat', select:'Tanlangan davlat', clear:'Tozalash', back:'Dunyo xaritasiga qaytish', details:'Hamkorlik tafsilotlari', count:'ta hamkor', unknown:'Manzil kiritilmagan' },
  ru: { kicker:'FSTU / GLOBAL CONNECTIONS', title:'Сотрудничество без границ', subtitle:'Выберите страну на карте мира и узнайте о вузах-партнёрах.', countries:'Страны-партнёры', universities:'Университеты-партнёры', explore:'EXPLORE COUNTRIES', directory:'Каталог университетов', all:'Все страны', search:'Поиск страны или университета...', website:'Официальный сайт', location:'Адрес', google:'Посмотреть на карте', none:'В этой стране университеты-партнёры не найдены.', empty:'Партнёры не найдены.', loading:'Загрузка карты...', error:'Не удалось загрузить GeoJSON. Проверьте public/maps/countries.geo.json.', hint:'Нажмите на страну, чтобы выбрать её', partner:'Страна-партнёр', select:'Выбранная страна', clear:'Сбросить', back:'Вернуться к карте мира', details:'Сведения о партнёрах', count:'партнёров', unknown:'Адрес не указан' },
  en: { kicker:'FSTU / GLOBAL CONNECTIONS', title:'Partnerships without borders', subtitle:'Select a country on the world map to explore partner universities.', countries:'Partner countries', universities:'Partner universities', explore:'EXPLORE COUNTRIES', directory:'University directory', all:'All countries', search:'Search countries or universities...', website:'Official website', location:'Address', google:'View on map', none:'No partner universities listed for this country.', empty:'No partner universities found.', loading:'Loading map...', error:'GeoJSON could not be loaded. Check public/maps/countries.geo.json.', hint:'Select a country on the map', partner:'Partner country', select:'Selected country', clear:'Clear', back:'Back to world map', details:'Partnership details', count:'partners', unknown:'Address unavailable' }
};
const ALIASES = {
  uz:'uzbekistan', uzb:'uzbekistan', ozbekiston:'uzbekistan', uzbekiston:'uzbekistan',
  ru:'russia', rus:'russia', rossiya:'russia', russianfederation:'russia',
  cn:'china', chn:'china', xitoy:'china', de:'germany', deu:'germany', germaniya:'germany',
  us:'unitedstatesofamerica', usa:'unitedstatesofamerica', unitedstates:'unitedstatesofamerica', aqsh:'unitedstatesofamerica',
  gb:'unitedkingdom', gbr:'unitedkingdom', greatbritain:'unitedkingdom', buyukbritaniya:'unitedkingdom',
  kr:'southkorea', kor:'southkorea', republicofkorea:'southkorea', korearepublicof:'southkorea', janubiykoreya:'southkorea',
  tr:'turkey', tur:'turkey', turkiye:'turkey', turkiya:'turkey', kz:'kazakhstan', kaz:'kazakhstan', qozogiston:'kazakhstan',
  kg:'kyrgyzstan', kgz:'kyrgyzstan', qirgiziston:'kyrgyzstan', tj:'tajikistan', tjk:'tajikistan', tojikiston:'tajikistan',
  pl:'poland', pol:'poland', polsha:'poland', hu:'hungary', hun:'hungary', vengriya:'hungary',
  it:'italy', ita:'italy', italiya:'italy', fr:'france', fra:'france', fransiya:'france',
  jp:'japan', jpn:'japan', yaponiya:'japan', in:'india', ind:'india', hindiston:'india',
  my:'malaysia', mys:'malaysia', malayziya:'malaysia', id:'indonesia', idn:'indonesia', indoneziya:'indonesia',
  lv:'latvia', lva:'latvia', latviya:'latvia', at:'austria', aut:'austria', avstriya:'austria',
  sk:'slovakia', svk:'slovakia', slovakiya:'slovakia', cz:'czechia', cze:'czechia', czechrepublic:'czechia', chexiya:'czechia',
  ca:'canada', can:'canada', kanada:'canada', au:'australia', aus:'australia', avstraliya:'australia',
  sa:'saudiarabia', sau:'saudiarabia', pk:'pakistan', pak:'pakistan', br:'brazil', bra:'brazil'
};
const keyOf = value => { const k = String(value ?? '').normalize('NFKD').toLowerCase().replace(/[ʻ‘’'`]/g,'').replace(/[^a-z0-9]/g,''); return ALIASES[k] || k; };
const countryOf = p => { const v=p.countryCode ?? p.country_code ?? p.countryName ?? p.country_name ?? p.country ?? p.location?.country ?? ''; return typeof v === 'object' && v ? String(v.code ?? v.name ?? v.title ?? '') : String(v); };
const addressOf = p => { const v=p.address ?? p.address_uz ?? p.location?.address ?? p.fullAddress ?? p.full_address ?? p.universityAddress ?? p.university_address ?? ''; return typeof v === 'object' && v ? String(v.formatted ?? v.name ?? v.title ?? '') : String(v); };
const safeURL = v => { try { const u=new URL(String(v ?? '').trim(), window.location.origin); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; } };
const Icon = ({name, size=18}) => {
  const paths = { globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-4 5-4 13 0 18M12 3c4 5 4 13 0 18"/></>, search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, pin:<><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>, arrow:<path d="M7 17 17 7M8 7h9v9"/>, close:<path d="M18 6 6 18M6 6l12 12"/>, school:<><path d="m3 10 9-6 9 6M3 10h18M5 10v10m4-10v10m6-10v10m4-10v10M2 21h20"/></> };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

// Equirectangular projection. Keep 180° boundary split to prevent Russia's
// eastern island geometry from drawing a line across the whole world.
const xy = ([lon, lat]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
function ringToPath(ring) {
  let current=[], paths=[], previous=null;
  const finish = () => { if(current.length >= 3) paths.push(current.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')+' Z'); current=[]; };
  for(const p of ring || []) {
    if(!Array.isArray(p) || !Number.isFinite(+p[0]) || !Number.isFinite(+p[1])) continue;
    const next=xy(p);
    if(previous !== null && Math.abs(next[0] - previous[0]) > W/2) finish();
    current.push(next);
    previous=next;
  }
  finish(); return paths.join(' ');
}
function geometryPath(geometry) {
  if(!geometry?.coordinates) return '';
  if(geometry.type === 'Polygon') return geometry.coordinates.map(ringToPath).join(' ');
  if(geometry.type === 'MultiPolygon') return geometry.coordinates.flatMap(poly => poly.map(ringToPath)).join(' ');
  return '';
}
function PartnerLogo({src,alt}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[src]);
  return src && !failed ? <img src={src} alt={alt} loading="lazy" onError={()=>setFailed(true)} /> : <Icon name="school" size={30}/>;
}
function UniversityCard({item,ui}) {
  const address=addressOf(item);
  const website=safeURL(item.link || item.website || item.url);
  const mapUrl=address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';
  return <article className="pp-university">
    <div className="pp-university__logo"><PartnerLogo src={item.image} alt={item.displayTitle}/></div>
    <div className="pp-university__content">
      <span className="pp-university__country">{item.countryLabel}</span>
      <h3>{item.displayTitle}</h3>
      <div className="pp-university__address"><Icon name="pin" size={15}/><span>{address || ui.unknown}</span></div>
      <div className="pp-university__links">
        {website && <a href={website} target="_blank" rel="noopener noreferrer">{ui.website}<Icon name="arrow" size={14}/></a>}
        {mapUrl && <a href={mapUrl} target="_blank" rel="noopener noreferrer">{ui.google}<Icon name="arrow" size={14}/></a>}
      </div>
    </div>
  </article>;
}
function InteractiveWorld({features, counts, selected, onSelect, ui}) {
  const [hover,setHover]=useState(null);
  const paths=useMemo(()=>features.map((f,index)=>({id:String(f.id ?? index), name:String(f.properties?.name ?? ''), key:keyOf(f.properties?.name), d:geometryPath(f.geometry)})).filter(p=>p.d),[features]);
  const highlighted=hover || (selected ? paths.find(p=>p.key === selected) : null);
  return <div className="pp-world-container">
    <div className="pp-map-bar"><span className="pp-eyebrow"><span className="pp-live-dot"/>{ui.explore}</span><span className="pp-map-help">{ui.hint}</span></div>
    <div className="pp-map-canvas">
      <svg className="pp-world-map" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label={ui.countries}>
        <defs><linearGradient id="pp-country-active" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#25c9d2"/><stop offset="1" stopColor="#1376a9"/></linearGradient></defs>
        {paths.map(p=> <path key={p.id} d={p.d} className={`pp-map-country ${counts.has(p.key)?'is-partner':''} ${selected===p.key?'is-selected':''}`} fillRule="evenodd" tabIndex={0} role="button" aria-label={`${p.name}, ${counts.get(p.key)?.count || 0} ${ui.universities}`} aria-pressed={selected === p.key} onMouseEnter={()=>setHover(p)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(p)} onBlur={()=>setHover(null)} onClick={()=>onSelect(p.key)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(p.key);}}}><title>{p.name} — {counts.get(p.key)?.count || 0} {ui.universities}</title></path>)}
      </svg>
    </div>
    <div className="pp-map-footer">
      <div className="pp-map-legend"><span><i className="pp-legend-neutral"/>{ui.all}</span><span><i className="pp-legend-partner"/>{ui.partner}</span><span><i className="pp-legend-active"/>{ui.select}</span></div>
      {highlighted && <div className="pp-map-hover"><strong>{highlighted.name}</strong><small>{counts.get(highlighted.key)?.count || 0} {ui.universities.toLowerCase()}</small></div>}
    </div>
  </div>;
}
// In-page focus: selected country on the left, partner university list on the right.
// ViewBox uses the largest contiguous polygon, so antimeridian islands do not
// squash the Russian mainland (or other distant island groups).
function CountryFocus({feature, countryName, universities, loading, onBack, ui}) {
  const data = useMemo(() => {
    if (!feature?.geometry) return null;
    const geometry = feature.geometry;
    const polygons = geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
    if (!polygons.length) return null;
    const scored = polygons.map(poly => {
      const points = (poly[0] || []).filter(p => Array.isArray(p) && Number.isFinite(+p[0]) && Number.isFinite(+p[1])).map(xy);
      if (!points.length) return null;
      const xs = points.map(pt => pt[0]), ys = points.map(pt => pt[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      return {poly, minX, maxX, minY, maxY, area:(maxX-minX)*(maxY-minY)};
    }).filter(Boolean).sort((a,b)=>b.area-a.area);
    const main = scored[0];
    if (!main) return null;
    const padding = Math.max(main.maxX-main.minX,main.maxY-main.minY)*.12+12;
    return {
      path: geometryPath({type:'Polygon',coordinates:main.poly}),
      viewBox: `${main.minX-padding} ${main.minY-padding} ${Math.max(24,main.maxX-main.minX+padding*2)} ${Math.max(24,main.maxY-main.minY+padding*2)}`
    };
  },[feature]);
  return <section className="pp-focus" key={countryName}>
    <div className="pp-focus__top">
      <button type="button" className="pp-back" onClick={onBack}>
        <span aria-hidden="true">←</span>{ui.back}
      </button>
      <span className="pp-focus__label">FSTU / {ui.details}</span>
    </div>
    <div className="pp-focus__grid">
      <div className="pp-focus__map">
        <div className="pp-focus__intro"><span className="pp-eyebrow">{ui.select}</span><h2>{countryName}</h2><p>{universities.length} {ui.count}</p></div>
        <div className="pp-focus__graphic">
          {data ? <svg viewBox={data.viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={countryName}>
            <defs><linearGradient id="pp-focus-gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" stopColor="#80ead2"/><stop offset="1" stopColor="#2fb3cb"/></linearGradient></defs>
            <path d={data.path} fill="url(#pp-focus-gradient)" stroke="#f9ffff" strokeWidth="1.1" vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
          </svg> : <span>{ui.loading}</span>}
        </div>
        <div className="pp-focus__foot"><span className="pp-focus__dot"/>{ui.partner}</div>
      </div>
      <div className="pp-focus__directory">
        <header className="pp-focus__directory-header"><span className="pp-eyebrow">{ui.directory}</span><h2>{ui.universities}</h2><span className="pp-focus__count">{universities.length}</span></header>
        <div className="pp-focus__results">{loading ? <div className="pp-empty">{ui.loading}</div> : universities.length ? universities.map((item,i)=><div key={item._id} className="pp-focus__item" style={{animationDelay:`${Math.min(i,12)*55}ms`}}><UniversityCard item={item} ui={ui}/></div>) : <div className="pp-empty">{ui.none}</div>}</div>
      </div>
    </div>
  </section>;
}
export default function PartnersPage(){
  const {currentLanguageCode}=useLanguage();
  const ui=UI[currentLanguageCode] || UI.uz;
  const {items:rawPartners=[],loading}=useContentList('partners',{revalidate:true});
  const [features,setFeatures]=useState([]);
  const [mapStatus,setMapStatus]=useState('loading');
  const [selected,setSelected]=useState('');
  const [search,setSearch]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    (async()=>{try{setMapStatus('loading');const res=await fetch(GEO_URL,{signal:controller.signal});if(!res.ok)throw new Error(`GeoJSON: ${res.status}`);const json=await res.json();if(!Array.isArray(json.features))throw new Error('Invalid GeoJSON');if(!controller.signal.aborted){setFeatures(json.features);setMapStatus('ready');}}
    catch(e){if(!controller.signal.aborted){console.error(e);setMapStatus('error');}}})();
    return()=>controller.abort();
  },[]);
  const partners=useMemo(()=>(Array.isArray(rawPartners)?rawPartners:[]).filter(Boolean).map((p,i)=>{const countryLabel=countryOf(p);return {...p,_id:String(p.id ?? i),countryLabel,countryKey:keyOf(countryLabel),displayTitle:getTranslatedField(p,'title',p.title || 'Partner',currentLanguageCode)};}),[rawPartners,currentLanguageCode]);
  const counts=useMemo(()=>{const map=new Map();for(const p of partners){if(!p.countryKey)continue;const c=map.get(p.countryKey)||{key:p.countryKey,name:p.countryLabel,count:0};c.count++;map.set(p.countryKey,c);}return map;},[partners]);
  const countries=useMemo(()=>[...counts.values()].sort((a,b)=>a.name.localeCompare(b.name)),[counts]);
  const selectedName=features.find(f=>keyOf(f.properties?.name)===selected)?.properties?.name || countries.find(c=>c.key===selected)?.name;
  const selectedFeature=features.find(f=>keyOf(f.properties?.name)===selected);
  const visibleUniversities=partners.filter(p=>p.countryKey===selected);
  return <main className="partners-page" id="xalqaro">
    <div className="pp-layout">
      <div className="pp-main">
        {selected ? <CountryFocus feature={selectedFeature} countryName={selectedName || selected} universities={visibleUniversities} loading={loading} onBack={()=>{setSelected('');setSearch('');}} ui={ui}/> : <>
          <header className="pp-hero">
            <div><span className="pp-eyebrow"><Icon name="globe" size={15}/>{ui.kicker}</span><h1>{ui.title}</h1><p>{ui.subtitle}</p></div>
            <div className="pp-metrics"><div><strong>{countries.length}</strong><span>{ui.countries}</span></div><div><strong>{partners.length}</strong><span>{ui.universities}</span></div></div>
          </header>
          {mapStatus==='ready' ? <InteractiveWorld features={features} counts={counts} selected={selected} onSelect={setSelected} ui={ui}/> : <div className="pp-map-message">{mapStatus==='loading'?ui.loading:ui.error}</div>}
          <section className="pp-directory">
            <div className="pp-directory__header"><div><span className="pp-eyebrow">{ui.explore}</span><h2>{ui.countries}</h2></div><label className="pp-search"><Icon name="search" size={17}/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder={ui.search}/>{search&&<button type="button" onClick={()=>setSearch('')} aria-label={ui.clear}><Icon name="close" size={14}/></button>}</label></div>
            <div className="pp-filters"><button type="button" onClick={()=>setSelected('')} className="pp-filter is-active">{ui.all}<b>{partners.length}</b></button>{countries.filter(c=>!search.trim()||c.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).map(c=><button type="button" key={c.key} className="pp-filter" onClick={()=>setSelected(c.key)}>{c.name}<b>{c.count}</b></button>)}</div>
          </section>
        </>}
      </div>
      <aside className="pp-sidebar"><AcademicSidebar/></aside>
    </div>
  </main>;
}
