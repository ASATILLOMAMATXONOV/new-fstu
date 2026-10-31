const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const Module = require('node:module');
const rootPath = path.resolve(__dirname, '..');
const frontendModules = path.join(rootPath, 'frontend/node_modules');
const adminModules = path.join(rootPath, 'admin/node_modules');
const adminSource = path.join(rootPath, 'admin/src');
const { JSDOM } = require(path.join(frontendModules, 'jsdom'));
const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'ShadowRoot', 'DocumentFragment', 'Node', 'Event', 'MouseEvent', 'MutationObserver', 'File', 'FileReader']) global[key] = key === 'window' ? dom.window : dom.window[key];
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.getComputedStyle = dom.window.getComputedStyle;
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
global.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.HTMLElement.prototype.getBoundingClientRect = function () { return { x: 0, y: 0, width: 400, height: 40, top: 0, left: 0, right: 400, bottom: 40 }; };
const React = require(path.join(adminModules, 'react'));
const { createRoot } = require(path.join(adminModules, 'react-dom/client'));
const { act } = require(path.join(adminModules, 'react-dom/test-utils'));
const { screen, within, fireEvent } = require(path.join(frontendModules, '@testing-library/dom'));
const babel = require(path.join(frontendModules, '@babel/core'));
let setting = { menus: [] };
const apiMenus = {
  menus: [{ id: 100, uz: { title: 'Universitet tarixi' }, en: { title: 'University history' } }],
  'academic-menus': [{ id: 200, uz: { title: 'Akademik nizom' } }]
};
const load = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'api/cms') return {
    fetchSetting: async () => structuredClone(setting),
    fetchContentList: async resource => structuredClone(apiMenus[resource] || []),
    saveSetting: async (key, payload) => { assert.equal(key, 'academic-structure'); setting = structuredClone(payload); return structuredClone(setting); }
  };
  if (request === 'components/MainCard') return { __esModule: true, default: ({ title, secondary, children }) => React.createElement('section', {}, React.createElement('h1', {}, title), secondary, children) };
  const aliases = { 'constants/academic-sources': 'constants/academic-sources.js', 'components/AdminTablePagination': 'components/AdminTablePagination.jsx', 'hooks/useTablePagination': 'hooks/useTablePagination.js', 'utils/file': 'utils/file.js' };
  return load.call(this, aliases[request] ? path.join(adminSource, aliases[request]) : request, parent, isMain);
};
for (const extension of ['.jsx', '.js']) {
  const previous = require.extensions[extension] || require.extensions['.js'];
  require.extensions[extension] = (module, filename) => {
    if (!filename.startsWith(adminSource + path.sep)) return previous(module, filename);
    const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), { filename, configFile: false, babelrc: false, presets: [
      [require.resolve(path.join(frontendModules, '@babel/preset-env')), { targets: { node: 'current' } }],
      [require.resolve(path.join(frontendModules, '@babel/preset-react')), { runtime: 'automatic' }]
    ] });
    module._compile(code, filename);
  };
}
const { buildAcademicSourceOptions } = require(path.join(adminSource, 'constants/academic-sources.js'));
const choices = buildAcademicSourceOptions([...apiMenus.menus, ...apiMenus['academic-menus'], ...apiMenus.menus]);
assert.equal(choices.filter(option => option.group === 'Sayt menyulari').length, 2);
for (const source of ['news', 'announcements', 'students', 'partners', 'pages', 'employees', 'statistics', 'banners', 'advantages']) assert.ok(choices.find(option => option.value === source));
const Page = require(path.join(adminSource, 'pages/extra-pages/academic-structure-management.jsx')).default;
const button = name => screen.getByRole('button', { name, exact: true });
const click = async element => act(async () => fireEvent.click(element));
const select = async (name) => {
  const input = screen.getByRole('combobox', { name: 'Biriktiriladigan menyu' });
  await act(async () => { fireEvent.focus(input); fireEvent.change(input, { target: { value: name } }); fireEvent.keyDown(input, { key: 'ArrowDown' }); });
  await click(screen.getByRole('option', { name, exact: true }));
};

(async () => {
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Page)));
  for (const [label, source] of [['Yangiliklar', 'news'], ['E’lonlar', 'announcements'], ['Talabalar', 'students'], ['Universitet tarixi', 'menu'], ['Akademik nizom', 'menu']]) {
    await click(button('Menyu qo‘shish'));
    await select(label);
    const title = screen.getByRole('textbox', { name: 'Menyu nomi' });
    assert.equal(title.value, label);
    assert.equal(title.readOnly, true);
    assert.equal(title.required, false);
    await click(button('Saqlash'));
    const saved = setting.menus[setting.menus.length - 1];
    assert.equal(saved.sourceType, source);
    assert.equal(saved.title.uz, label);
    if (label === 'Universitet tarixi') assert.equal(saved.menuId, '100');
    if (label === 'Akademik nizom') assert.equal(saved.menuId, '200');
    console.log(`PASS: ${label} selectable and saved with its automatic name`);
  }
  await click(button('Yangiliklar — tahrirlash'));
  await select('Hamkorlar');
  await click(button('Saqlash'));
  assert.equal(setting.menus[0].sourceType, 'partners');
  assert.equal(setting.menus[0].title.en, 'Partners');
  const table = screen.getByRole('table', { name: 'Tuzilma xaritasi menyulari' });
  assert.equal(within(table).getAllByRole('row').length, 6);
  console.log('PASS: editing updates the linked source and automatic translations');
  await act(async () => root.unmount());
  dom.window.close();
})().catch(error => { console.error(error); process.exitCode = 1; dom.window.close(); });
