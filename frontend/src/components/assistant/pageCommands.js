import { getCachedContentList, getCachedContentTree } from '../../api/cms';
import { flattenMenuNodes, getMenuNodeHref, getMenuNodeTitle } from '../../utils/menu';
import { isReadPageCommand } from './pageReader';

const pages = [
  { path: '/', titles: ['Bosh sahifa', 'Главная', 'Home'], aliases: ['bosh', 'asosiy', 'home', 'главная'] },
  { path: '/news', titles: ['Yangiliklar', 'Новости', 'News'], aliases: ['yangilik', 'news', 'новости'] },
  { path: '/announcements', titles: ['E’lonlar', 'Объявления', 'Announcements'], aliases: ['elon', 'announcement', 'объявления'] },
  { path: '/faculties', titles: ['Fakultetlar', 'Факультеты', 'Faculties'], aliases: ['fakultet', 'faculties', 'faculty', 'факультет'] },
  { path: '/departments', titles: ['Kafedralar', 'Кафедры', 'Departments'], aliases: ['kafedra', 'department', 'кафедра'] },
  { path: '/sections', titles: ['Bo‘limlar', 'Отделы', 'Sections'], aliases: ['bolim', 'section', 'отдел'] },
  { path: '/admission', titles: ['Qabul', 'Приём', 'Admissions'], aliases: ['qabul', 'abituriyent', 'admission', 'прием', 'приём'] },
  { path: '/rektor', titles: ['Rektor murojaati', 'Обращение ректора', 'Rector’s address'], aliases: ['rektor', 'rector', 'ректор'] },
  { path: '/students', titles: ['Talabalar', 'Студенты', 'Students'], aliases: ['talaba', 'student', 'студент'] },
  { path: '/partners', titles: ['Hamkorlar', 'Партнёры', 'Partners'], aliases: ['hamkor', 'partner', 'партнер', 'партнёр'] }
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[‘’ʻʼ'`]/g, '').replace(/saxifa/g, 'sahifa')
    .replace(/matin/g, 'matn').replace(/\bebr\b/g, 'ber').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}
function terms(value) {
  return normalize(value).split(' ').map(word => word.replace(/(?:laridagi|larining|laridan|lariga|larida|larning|larini|larni|larga|lari|sini|siga|ning|dagi|dan|lar|ni|ga)$/, '')).filter(Boolean);
}

const filler = /^(?:sahifa\w*|matn\w*|frontend\w*|sayt\w*|yerda\w*|ekran\w*|hozirgi|hozir|hamma\w*|barcha|toliq|shu|bu|uni|buni|shuni|ham|va|keyin|song|haqida|iltimos|menga|ber\w*|och\w*|oqi\w*|tushuntir\w*|korsat\w*|ot|oting|otish|kir|kiring|kirish|bolim\w*|read|speak|current|aloud|open|show|go|to|the|this|page|text|and|please|открой\p{L}*|покажи\p{L}*|прочитай\p{L}*|прочтите|озвуч\p{L}*|страниц\p{L}*|текст\p{L}*)$/u;
const navigationWord = /^(?:och(?:ib|ing|gin|sin|ish)?|korsat(?:ib|ing|gin|sin|ish)?|ot(?:ib|ing|gin|sin|ish|kaz(?:ib|ing|gin)?)?|kir(?:ib|ing|gin|sin|ish|giz(?:ib|ing)?)?|qayt(?:ib|ing|gin|sin|ish)?|open|show|go|visit|navigate|открой\p{L}*|покажи\p{L}*|перейди\p{L}*|зайди\p{L}*)$/u;
const navigationFiller = /^(?:meni|bizni|olib|ol|olasanmi|olasizmi|bor(?:ib|ing|gin|sin|ish)?|bilan|birga|on|into|me|can|could|you|пожалуйста|на|в|к|перейти|зайти)$/u;

function internalPath(value, doc) {
  try {
    const url = new URL(value, doc.baseURI);
    if (url.origin !== new URL(doc.baseURI).origin || !/^\/(?:$|#|news(?:\/|$)|announcements(?:\/|$)|faculties(?:\/|$)|departments(?:\/|$)|sections(?:\/|$)|students(?:\/|$)|partners(?:\/|$)|admission(?:\/|$)|rektor(?:\/|$)|pages\/|menu\/|employees\/)/.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return null; }
}

export function availablePages(language = 'uz', doc = document) {
  const languageIndex = { uz: 0, ru: 1, en: 2 }[language] || 0;
  const candidates = pages.map(page => ({ path: page.path, title: page.titles[languageIndex], aliases: [...page.titles, ...page.aliases] }));
  const add = (path, title, aliases = []) => {
    const safePath = internalPath(path, doc);
    if (safePath && title?.trim()) candidates.push({ path: safePath, title: title.trim(), aliases: [title.trim(), ...aliases.filter(Boolean)] });
  };
  for (const resource of ['menus', 'academic-menus']) {
    for (const node of flattenMenuNodes(getCachedContentTree(resource) || [])) {
      if (node.active !== false) add(getMenuNodeHref(node), getMenuNodeTitle(node, language), ['uz', 'ru', 'en'].map(code => getMenuNodeTitle(node, code)));
    }
  }
  for (const resource of ['faculties', 'pages', 'news', 'announcements', 'students']) {
    const items = [...(getCachedContentList(resource) || []), ...(resource === 'faculties' ? [
      ...(getCachedContentList(resource, { entityType: 'faculty' }) || []),
      ...(getCachedContentList(resource, { entityType: 'section' }) || []).map(item => ({ ...item, entityType: 'section' }))
    ] : [])];
    for (const item of items) {
      if (item.active === false) continue;
      const title = item[language]?.title || item.uz?.title || item.title;
      const path = ['news', 'announcements'].includes(resource) ? `/${resource}/page/${item.id}`
        : resource === 'faculties' && item.entityType === 'section' ? `/sections/${item.id}` : `/${resource}/${item.id}`;
      add(path, title, ['uz', 'ru', 'en'].map(code => item[code]?.title));
      for (const department of item.departments || []) {
        if (department.active !== false && department.id) add(`/departments/${item.id}/${department.id}`, department[language]?.title || department.uz?.title || department.title, ['uz', 'ru', 'en'].map(code => department[code]?.title));
      }
    }
  }
  for (const link of doc.querySelectorAll('a[href]')) {
    if (link.closest('.fstu-ai, .fstu-robot-world, [data-assistant-ignore]')) continue;
    const card = link.closest('article');
    const title = card?.querySelector('h1,h2,h3,h4')?.textContent || link.getAttribute('aria-label') || link.textContent;
    add(link.getAttribute('href'), title);
  }
  return candidates;
}

export function resolvePageCommand(value, { language = 'uz', doc = document } = {}) {
  const normalized = normalize(value);
  if (/(?:^|\s)(?:ochma\w*|ochirma\w*|oqima\w*|kirma\w*|otma\w*|borma\w*|korsatma\w*|dont|do not|не)(?:\s|$)/.test(normalized)) return null;
  const reading = isReadPageCommand(value);
  const question = /\b(?:qanday|qachon|nima|nega|nimaga|qancha|nechta|bormi|mumkin|kerak|how|why|when|what)\b/.test(normalized);
  const opening = (normalized.split(' ').some(word => navigationWord.test(word))
    || /(?:^|\s)olib bor(?:ib|ing|gin|sin)?(?:\s|$)/.test(normalized)) && !question;
  const candidates = availablePages(language, doc);
  const namedPage = !question && candidates.some(page => page.aliases.some(alias => normalize(alias) === normalized));
  if (!reading && !opening && !namedPage) return null;
  const query = terms(normalized.split(' ').filter(word => !filler.test(word) && !navigationWord.test(word) && !navigationFiller.test(word)).join(' '));
  if (!query.length && /\bbolim\w*/.test(normalized) && opening) query.push('bolim');
  if (!query.length) return reading && !opening ? { type: 'read' } : { type: 'missing' };
  const matches = candidates.map(page => {
    const score = Math.max(...page.aliases.map(alias => {
      const label = terms(alias);
      const covers = query.every(word => label.some(term => term === word || (Math.min(term.length, word.length) >= 4 && (term.startsWith(word) || word.startsWith(term)))));
      return covers ? 100 + query.length * 10 - Math.abs(label.length - query.length) : 0;
    }));
    return { ...page, score };
  }).filter(page => page.score > 0).sort((a, b) => b.score - a.score);
  if (!matches.length) return { type: 'missing' };
  if (matches[1]?.score === matches[0].score && matches[1].path !== matches[0].path) return { type: 'missing' };
  return { type: 'navigate', path: matches[0].path, title: matches[0].title, read: reading };
}

export function pageCommandReply(command, language = 'uz') {
  if (command.type === 'missing') return language === 'ru' ? 'Какую страницу открыть? Назовите её полное название из меню.'
    : language === 'en' ? 'Which page should I open? Please say its full menu title.'
      : 'Qaysi sahifani ochay? Menyudagi sahifa nomini to‘liq ayting yoki yozing.';
  return language === 'ru' ? `Открываю страницу «${command.title}».` : language === 'en' ? `Opening ${command.title}.` : `${command.title} sahifasini ochdim.`;
}
