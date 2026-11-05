const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('../frontend/node_modules/jsdom');

(async () => {
  const errors = [];
  const consoleProxy = new VirtualConsole();
  consoleProxy.on('jsdomError', error => { if (!/navigation|scrollTo/.test(error.message)) errors.push(error.stack || error.message); });
  consoleProxy.on('error', (...args) => errors.push(args.map(String).join(' ')));
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
    url: process.argv.includes('--security-flow') ? 'http://localhost:3001/cybersecurity' : 'http://localhost:3001/banner-management', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: consoleProxy
  });
  const win = dom.window;
  win.matchMedia = query => ({ matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.scrollTo = () => {};
  win.TextEncoder = TextEncoder;
  win.TextDecoder = TextDecoder;
  win.Request = Request;
  win.Response = Response;
  win.Headers = Headers;
  win.AbortController = AbortController;
  win.AbortSignal = AbortSignal;
  win.$RefreshReg$ = () => {};
  win.$RefreshSig$ = () => type => type;
  const flow = process.argv.includes('--login-flow');
  const securityFlow = process.argv.includes('--security-flow');
  const stamp = '2026-11-05T12:00:00Z';
  const future = new Date(Date.now() + 3600000).toISOString();
  const targetIp = '203.0.113.44';
  let testBlock = null;
  const testEvents = [{ id: 1, ip: targetIp, first_seen: stamp, last_seen: stamp, event_type: 'sql_probe',
    summary: 'SQL attack request rejected', action: 'rejected', method: 'GET', path: '/api/content/news', status_code: 403, severity: 'high', occurrences: 3 }];
  let failSources = false;
  let attempts = 0;
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  win.fetch = (url, options) => {
    const address = new URL(url, win.location.href);
    if (securityFlow && address.pathname.startsWith('/api/')) {
      if (address.pathname === '/api/account/me') return Promise.resolve(json({user:{id:99,fullName:'DOM Test Admin',login:'fake-admin',role:'super_admin',active:true,menuAccess:[],mfaEnabled:true},csrfToken:'test-only-csrf'}));
      if (address.pathname === '/api/security/overview') return Promise.resolve(json({timestamp:stamp,currentIp:'127.0.0.1', totals:{sources:1,prevented:3,activeBlocks:testBlock ? 1 : 0,login_failures:0}, monitor:{},checks:[],audit:{projects:[]},policy:{loginLimit:10,loginWindowMinutes:10,requestLimit:600,writeLimit:30,blockMinutes:15,retentionDays:30}}));
      if (address.pathname === '/api/security/sources') return Promise.resolve(failSources ? json({message:'Test storage unavailable'},503) : json({items:[{ip:targetIp,attempts:3,first_seen:stamp,last_seen:stamp,last_login_at:null,event_type:'sql_probe',method:'GET',path:'/api/content/news',status_code:403,action:'rejected',suspicious:true,blocked_until:testBlock?.blocked_until}],total:1,block:testBlock}));
      if (address.pathname === '/api/security/events') return Promise.resolve(json({items:testEvents,total:testEvents.length}));
      if (address.pathname === '/api/security/blocks' && options?.method === 'POST') {
        assert.equal(options.headers['X-CSRF-Token'],'test-only-csrf');
        const body = JSON.parse(options.body);
        assert.equal(body.ip,targetIp);
        testBlock = {ip:body.ip,reason:body.reason,created_at:stamp,blocked_until:future,created_by:99,source:'manual'};
        testEvents.push({...testEvents[0],id:2,event_type:'manual_block',action:'blocked',summary:body.reason,occurrences:1});
        return Promise.resolve(json({message:'Blocked'},201));
      }
      if (address.pathname === '/api/security/blocks') return Promise.resolve(json({items:testBlock ? [testBlock] : [],total:testBlock ? 1 : 0}));
      if (address.pathname === '/api/security/blocks/'+targetIp && options?.method === 'DELETE') {
        assert.equal(options.headers['X-CSRF-Token'],'test-only-csrf'); testBlock=null;
        return Promise.resolve(json({message:'Unblocked'}));
      }
      if (address.pathname === '/api/menu/dashboard') return Promise.resolve(json({dashboard:{}}));
      return Promise.resolve(json({items:[]}));
    }
    if (!flow) return fetch(address, options);
    if (address.pathname === '/api/account/me') return Promise.resolve(json({ message: 'No session' }, 401));
    if (address.pathname === '/api/account/login') return Promise.resolve(json({ stage: 'password_change', challengeToken: 'test-only-challenge' }));
    if (address.pathname === '/api/account/login/password') return Promise.resolve(json({ stage: 'enroll', challengeToken: 'test-only-challenge', secret: 'TESTONLY', qrCode: 'data:image/png;base64,' }));
    if (address.pathname === '/api/account/login/verify') {
      attempts++;
      return Promise.resolve(attempts === 1 ? json({ message: 'Wrong test code' }, 401) : json({ stage: 'recovery_codes', challengeToken: 'test-only-challenge', recoveryCodes: Array.from({length: 10}, (_, i) => 'TEST-ONLY-' + i) }));
    }
    if (address.pathname.startsWith('/api/')) return Promise.resolve(json({ items: [] }));
    return fetch(address, options);
  };
  new win.MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.tagName === 'LINK') setImmediate(() => node.dispatchEvent(new win.Event('load')));
  }))).observe(win.document.head, { childList: true });
  const context = dom.getInternalVMContext();
  const dist = path.resolve(__dirname, '../admin/dist');
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const entryPath = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/)[1];
  const modules = new Map();
  const development = process.argv.includes('--dev');
  async function devModule(url) {
    if (modules.has(url)) return modules.get(url);
    const promise = (async () => {
      const location = new URL(url).pathname;
      let source;
      if (location === '/@vite/client') source = 'export const createHotContext=()=>undefined;export const updateStyle=()=>{};export const removeStyle=()=>{};';
      else if (location === '/@react-refresh') source = 'export const getRefreshReg=()=>()=>{};export const createSignatureFunctionForTransform=()=>type=>type;export const registerExportsForReactRefresh=()=>{};export const validateRefreshBoundaryAndEnqueueUpdate=()=>null;';
      else if (/\.css$/.test(location)) source = 'export default "";';
      else {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Module ${location}: HTTP ${response.status}`);
        source = await response.text();
      }
      return new vm.SourceTextModule(source, {
        context, identifier: url,
        initializeImportMeta(meta) { meta.url = url; },
        async importModuleDynamically(specifier, parent) {
          const dependency = await devModule(new URL(specifier, parent.identifier).href);
          if (dependency.status === 'unlinked') await dependency.link((name, ref) => devModule(new URL(name, ref.identifier).href));
          if (dependency.status === 'linked') await dependency.evaluate();
          return dependency;
        }
      });
    })();
    modules.set(url, promise);
    return promise;
  }
  function resolve(specifier, parent) {
    return specifier.startsWith('/') ? path.join(dist, specifier) : path.resolve(path.dirname(parent), specifier);
  }
  function moduleFor(filename) {
    if (modules.has(filename)) return modules.get(filename);
    const module = new vm.SourceTextModule(fs.readFileSync(filename, 'utf8'), {
      context, identifier: filename,
      initializeImportMeta(meta) { meta.url = 'http://localhost:3001/' + path.relative(dist, filename).replaceAll('\\', '/'); },
      async importModuleDynamically(specifier, parent) {
        const dependency = moduleFor(resolve(specifier, parent.identifier));
        if (dependency.status === 'unlinked') await dependency.link((name, ref) => moduleFor(resolve(name, ref.identifier)));
        if (dependency.status === 'linked') await dependency.evaluate();
        return dependency;
      }
    });
    modules.set(filename, module);
    return module;
  }
  try {
    const entry = development ? await devModule('http://localhost:3001/src/index.jsx') : moduleFor(resolve(entryPath, dist));
    await entry.link((specifier, parent) => development ? devModule(new URL(specifier, parent.identifier).href) : moduleFor(resolve(specifier, parent.identifier)));
    await entry.evaluate();
    await new Promise(resolve => setTimeout(resolve, 2500));
    if (securityFlow) {
      const wait = () => new Promise(resolve => setTimeout(resolve, 150));
      const click = async (label, within=win.document) => {
        const element = [...within.querySelectorAll('button')].find(item => item.textContent.trim() === label);
        assert.ok(element, 'Button exists: '+label); element.click(); await wait();
      };
      const panel = () => win.document.querySelector('[role="tabpanel"]');
      assert.match(panel().textContent,/SQL hujum urinishi/);
      assert.match(panel().textContent,/Birinchi:/);
      assert.match(panel().textContent,/Tasdiqlangan kirish qayd etilmagan/);
      assert.equal(win.document.querySelectorAll('[role="tab"]').length,5);
      await click('Tarixni ko‘rish');
      assert.match(win.document.querySelector('[role="dialog"]').textContent,/SQL attack request rejected/);
      await click('Bloklash bo‘limiga o‘tish');
      assert.equal(panel().querySelectorAll('table').length,0,'Block form is separate from block list');
      assert.equal(panel().querySelector('input').value,targetIp);
      const reason = panel().querySelector('textarea');
      Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype,'value').set.call(reason,'Confirmed test attack');
      reason.dispatchEvent(new win.Event('input',{bubbles:true})); await wait();
      panel().querySelector('form').dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true})); await wait();
      assert.equal(testBlock?.ip,targetIp);
      assert.match(panel().textContent,/Blok qo‘yilgan vaqt/);
      assert.match(panel().textContent,/Confirmed test attack/);
      assert.equal(panel().querySelectorAll('textarea').length,0,'Blocked list has no block form');
      await click('Blokni ochish',panel());
      await click('Blokni ochish',win.document.querySelector('[role="dialog"]'));
      assert.equal(testBlock,null);
      assert.match(panel().textContent,/Faol IP bloklari yo‘q/);
      await click('Hodisalar jurnali');
      assert.match(panel().textContent,/Super admin IP’ni blokladi/);
      await click('Himoya holati');
      assert.match(panel().textContent,/Serverdagi himoya holati/);
      await click('IP faolligi');
      failSources=true;
      await click('Yangilash');
      assert.match(panel().textContent,/Test storage unavailable/);
      assert.match(panel().textContent,/SQL hujum urinishi/,'Stale activity remains visible alongside a clear error');
      console.log('Mocked security DOM flow passed: IP timeline, separate block form/list, CSRF mutation, unblock confirmation, audit and stale-data error.');
    }
    if (flow) {
      const wait = () => new Promise(resolve => setTimeout(resolve, 50));
      const input = async (element, value) => {
        Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set.call(element, value);
        element.dispatchEvent(new win.Event('input', { bubbles: true }));
        await wait();
      };
      const submit = async () => { win.document.querySelector('form').dispatchEvent(new win.Event('submit', {bubbles: true, cancelable: true})); await wait(); };
      await input(win.document.querySelectorAll('input')[0], 'fake-user');
      await input(win.document.querySelectorAll('input')[1], 'test-only-password');
      await submit();
      assert.match(win.document.body.textContent, /Parolni kuchaytirish/);
      await input(win.document.querySelectorAll('input')[0], 'New!TestOnlyPassword8');
      await input(win.document.querySelectorAll('input')[1], 'Different');
      await submit();
      assert.match(win.document.body.textContent, /Yangi parollar bir xil/);
      await input(win.document.querySelectorAll('input')[1], 'New!TestOnlyPassword8');
      await submit();
      assert.equal(win.document.querySelector('img[alt="Autentifikatorni ulash uchun QR kod"]').width, 240);
      await input(win.document.querySelector('input[autocomplete="one-time-code"]'), '000000');
      await submit();
      assert.match(win.document.body.textContent, /Wrong test code/);
      assert.ok(win.document.querySelector('input[autocomplete="one-time-code"]'), 'Wrong code preserves enrollment state');
      await input(win.document.querySelector('input[autocomplete="one-time-code"]'), '111111');
      await submit();
      assert.match(win.document.body.textContent, /Tiklash kodlarini saqlash/);
      assert.equal(win.document.querySelector('button[type="submit"]').disabled, true);
      win.document.querySelector('input[type="checkbox"]').click();
      await wait();
      assert.equal(win.document.querySelector('button[type="submit"]').disabled, false);
      assert.equal(win.localStorage.getItem('serviceToken'), null);
      assert.equal(win.sessionStorage.getItem('serviceToken'), null);
      console.log('Mocked DOM flow passed: password change, confirmation, enrollment, OTP retry, backup acknowledgement gate; no browser session token.');
    }
    const body = win.document.getElementById('root').textContent;
    console.log(JSON.stringify({ renderedCharacters: body.length, text: body.slice(0, 600), url: win.location.href, errors }, null, 2));
    process.exitCode = errors.length || !body.length ? 1 : 0;
  } catch (error) {
    console.log(error.stack);
    process.exitCode = 1;
  } finally { win.close(); }
})().finally(() => setTimeout(() => process.exit(process.exitCode || 0), 50));
