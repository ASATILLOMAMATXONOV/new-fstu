export function plainText(value) {
  return String(value ?? '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&(?:lsquo|rsquo);/gi, '‘').replace(/&(?:ldquo|rdquo);/gi, '"')
    .replace(/&ndash;/gi, '–').replace(/&mdash;/gi, '—')
    .replace(/&#(x[\da-f]+|\d+);/gi, (entity, code) => {
      const point = code[0].toLowerCase() === 'x' ? Number.parseInt(code.slice(1), 16) : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '';
    })
    .replace(/\s+/g, ' ').trim();
}

const stopWords = new Set('haqida ayt aytib bering ber menga men siz qanday nima kim qaysi qancha nechta bormi bor bilan uchun kerak mumkin qachon qayerda qayer qilib bera olasiz qilasiz iltimos shu bu hozirgi sahifa malumot the a an is are of about tell me please what which how many can could на и о об расскажи пожалуйста сколько какой какие'.split(' '));
function words(value) {
  return plainText(value).toLowerCase().replace(/[‘’ʻʼ'`]/g, '').match(/[\p{L}\p{N}]+/gu)?.filter(word => !stopWords.has(word)).map(word => {
    let term = word;
    for (let index = 0; index < 2; index++) term = term.replace(/(?:larining|larimiz|laringiz|lardan|larini|larda|ning|lari|dagi|dan|lar|ga|da|ni|mi)$/, '');
    return term === 'fstu' ? 'universitet' : term;
  }).filter(word => word.length > 2 && !stopWords.has(word)) || [];
}

export function siteDocuments(context, page, language = 'uz') {
  const documents = [];
  if (page?.text) {
    for (const paragraph of page.text.split(/\n\s*\n|\n/).filter(Boolean)) {
      documents.push({ title: plainText(page.title), text: plainText(paragraph), resource: 'current_page' });
    }
  }
  for (const { resource, items = [] } of context) {
    for (const item of items.slice(0, 100)) {
      if (item.active === false) continue;
      const local = item.translations?.[language] || item[language] || {};
      const metadata = item.metadata || {};
      const title = plainText(local.title || local.name || item.title || item.name);
      const fields = ['content', 'text', 'description', 'summary', 'subtitle', 'address', 'phone', 'email', 'value', 'label'];
      const text = [...new Set(fields.flatMap(field => [local[field], item[field], metadata[field]])
        .filter(value => typeof value === 'string' || typeof value === 'number').map(plainText).filter(Boolean))].join('. ');
      const editorial = /(?:classname|responsive dizayn|hover va|kartochkada.*havolasi|kategoriya menyulari olib tashlandi)/i.test(`${title} ${text}`);
      if (!editorial && (text || title && !['menus', 'pages'].includes(resource))) documents.push({ title, text: text.slice(0, 5000), resource });
    }
  }
  return documents;
}

export function siteAnswer(message, context = [], page, language = 'uz') {
  if (language === 'uz' && /hemis/i.test(message) && /parol|kirish|login|tikla/i.test(message)) {
    return 'HEMISga kirish yoki parolni tiklash bo‘yicha yordam olish uchun fstuAI menyusidagi HEMIS bo‘limidan murojaat yuboring. Parolingizni suhbatga yozmang.';
  }
  const terms = [...new Set(words(message))];
  const specificTerms = terms.filter(term => term !== 'universitet');
  const matchesWord = (word, term) => word === term || Math.min(word.length, term.length) >= 5 && (word.startsWith(term) || term.startsWith(word));
  const documents = siteDocuments(context, page, language);
  const matches = documents.map(document => {
    const title = words(document.title);
    const body = words(document.text);
    const relevant = !specificTerms.length || specificTerms.some(term => [...title, ...body].some(word => matchesWord(word, term)));
    const score = relevant ? terms.reduce((sum, term) => sum + (title.some(word => matchesWord(word, term)) ? 3 : 0)
      + (body.some(word => matchesWord(word, term)) ? 1 : 0), 0) : 0;
    return { ...document, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  if (matches.length) {
    const selected = matches.slice(0, 3).map(item => {
      const sentences = item.text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [item.text];
      const relevant = sentences.map((sentence, index) => ({ sentence: sentence.trim(), index,
        score: words(sentence).filter(word => terms.includes(word)).length }))
        .sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.index - b.index).map(item => item.sentence).join(' ');
      const alreadyTitled = relevant.toLowerCase().startsWith(item.title.toLowerCase());
      return item.resource === 'current_page' || alreadyTitled ? relevant : [item.title.replace(/[.!?]+$/, ''), relevant].filter(Boolean).join('. ');
    });
    return [...new Set(selected)].join('\n\n').slice(0, 3500);
  }
  if (language === 'ru') return 'По этому вопросу на сайте не нашлось точной информации. Уточните факультет или тему. Я также могу прочитать открытую страницу.';
  if (language === 'en') return 'I could not find exact information about that on the website. Please specify the faculty or topic. I can also read the current page aloud.';
  if (/hemis/i.test(message)) return 'HEMIS bo‘yicha muammo bo‘lsa, fstuAI menyusidagi HEMIS bo‘limidan murojaat yuboring. Parolingizni suhbatga yozmang.';
  return 'Bu savol bo‘yicha saytda aniq ma’lumot topilmadi. Fakultet, qabul, yangiliklar yoki HEMIS bo‘yicha savolingizni aniqlashtiring. «Sahifani o‘qib ber» desangiz, ochilgan sahifadagi matnni o‘qib beraman.';
}
