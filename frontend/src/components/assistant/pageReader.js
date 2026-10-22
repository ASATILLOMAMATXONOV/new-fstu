const ignored = '.fstu-ai, .fstu-robot-world, nav, aside, footer, button, form, script, style, [role="dialog"], [role="navigation"], [hidden], [aria-hidden="true"], [data-assistant-ignore]';

export function readCurrentPage(doc = document) {
  const rootSelector = 'main, [role="main"], .app-content-shell';
  const roots = [...doc.querySelectorAll(rootSelector)].filter(root => !root.parentElement?.closest(rootSelector));
  if (!roots.length) roots.push(doc.querySelector('#root') || doc.body);
  const blocks = [];
  const seen = new Set();
  for (const root of roots) {
    const walker = doc.createTreeWalker(root, 4);
    let lastBlock;
    let text = '';
    const flush = () => {
      const value = text.replace(/\s+/g, ' ').trim();
      if (value && !seen.has(value)) { blocks.push(value); seen.add(value); }
      text = '';
    };
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!node.textContent.trim() || !parent || parent.closest(ignored)) continue;
      if (parent.closest('header') && !parent.closest('main, [role="main"]')) continue;
      let visible = true;
      for (let element = parent; element && element !== root.parentElement; element = element.parentElement) {
        const style = doc.defaultView?.getComputedStyle(element);
        if (style?.display === 'none' || style?.visibility === 'hidden') { visible = false; break; }
      }
      if (!visible) continue;
      const block = parent.closest('h1,h2,h3,h4,h5,h6,p,li,dt,dd,th,td,address,blockquote,pre,div,section,article') || root;
      if (block !== lastBlock) { flush(); lastBlock = block; }
      text += node.textContent + ' ';
    }
    flush();
  }
  return {
    title: doc.querySelector('main h1, [role="main"] h1, main h2, [role="main"] h2')?.textContent?.trim() || doc.title,
    text: blocks.join('\n\n').slice(0, 20000)
  };
}

export function isReadPageCommand(value) {
  const normalized = value.toLowerCase().replace(/[‘’ʻʼ'`]/g, '').replace(/[.,!?]/g, ' ');
  return /(?:^|\s)(?:oqi(?:b|ng|sin|bber)?|oqibber|read|прочитай|прочтите|читай|озвуч\S*)(?:\s|$)/.test(normalized)
    || (/(?:sahifa|saxifa|matn|matin)/.test(normalized) && /tushuntir/.test(normalized));
}

export function waitForReadablePage({ target, getLocation, isLoading = () => false, signal, timeoutMs = 12000, settleMs = 350 }, doc = document) {
  return new Promise((resolve, reject) => {
    let previousText = '';
    let stableSince = 0;
    let arrived = false;
    let latest = { title: '', text: '' };
    let done = false;
    let observer;
    let timer;
    let deadline;
    const finish = (error) => {
      if (done) return;
      done = true;
      observer?.disconnect();
      clearInterval(timer);
      clearTimeout(deadline);
      signal?.removeEventListener('abort', abort);
      if (error) reject(error); else resolve(latest);
    };
    const abort = () => finish(new DOMException('Page reading cancelled', 'AbortError'));
    const check = () => {
      const actual = getLocation();
      const matches = actual === target;
      if (!matches) {
        if (arrived) abort();
        return;
      }
      arrived = true;
      latest = readCurrentPage(doc);
      if (isLoading() || !latest.text || !doc.querySelector('main, [role="main"], .app-content-shell')) {
        stableSince = 0;
        return;
      }
      if (latest.text !== previousText || !stableSince) { previousText = latest.text; stableSince = Date.now(); }
      if (Date.now() - stableSince >= settleMs) finish();
    };
    if (signal?.aborted) { abort(); return; }
    signal?.addEventListener('abort', abort, { once: true });
    observer = new MutationObserver(check);
    observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
    timer = setInterval(check, 100);
    deadline = setTimeout(() => finish(new Error('page-not-ready')), timeoutMs);
    check();
  });
}

export function pageReadingAnswer(page, language = 'uz') {
  if (page.text) return page.text;
  return language === 'ru' ? 'На этой странице пока нет текста для чтения.'
    : language === 'en' ? 'There is no readable text on this page yet.'
      : 'Bu sahifada hozircha o‘qish uchun matn topilmadi. Sahifa yuklangach, qayta ayting.';
}
