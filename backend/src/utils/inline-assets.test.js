import assert from 'node:assert/strict';
import test from 'node:test';

import { externalizeInlineAssets, resolveInlineAsset } from './inline-assets.js';

const bigPng = `data:image/png;base64,${Buffer.alloc(4000, 7).toString('base64')}`;
const smallPng = 'data:image/png;base64,iVBORw0KGgo=';
const buildUrl = (path, index) => `/asset?path=${path}${index === undefined ? '' : `&i=${index}`}`;

test('replaces large data URLs with asset URLs and resolves them back', () => {
  const source = { logo: bigPng, icon: smallPng, cards: [{ image: bigPng }] };
  const result = externalizeInlineAssets(source, buildUrl);

  assert.equal(result.logo, '/asset?path=logo');
  assert.equal(result.icon, smallPng);
  assert.equal(result.cards[0].image, '/asset?path=cards.0.image');

  const asset = resolveInlineAsset(source, 'cards.0.image');
  assert.equal(asset.mimeType, 'image/png');
  assert.equal(asset.buffer.length, 4000);
});

test('replaces data URLs embedded in HTML by occurrence index', () => {
  const html = `<p><img src="${smallPng}"><img src="${bigPng}"></p>`;
  const result = externalizeInlineAssets({ content: html }, buildUrl);

  assert.ok(result.content.includes(`src="${smallPng}"`));
  assert.ok(result.content.includes('src="/asset?path=content&i=1"'));
  assert.equal(resolveInlineAsset({ content: html }, 'content', '1').buffer.length, 4000);
  assert.equal(resolveInlineAsset({ content: html }, 'content', '5'), null);
});

test('returns null for missing or non data URL paths', () => {
  assert.equal(resolveInlineAsset({ a: 'https://example.com/x.png' }, 'a'), null);
  assert.equal(resolveInlineAsset({}, 'missing.path'), null);
});
