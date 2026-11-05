import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sanitizeHtml, sanitizeUrl, sanitizeStructuredContent } from './html-security.js';

test('rejects dangerous and obfuscated URL schemes and network paths', () => {
  for (const value of ['javascript:alert(1)', 'java\nscript:alert(1)', 'vbscript:msgbox(1)', 'data:text/html,<script>alert(1)</script>', '//evil.example', '/\\evil.example', 'file:///etc/passwd']) assert.equal(sanitizeUrl(value), '', value);
  for (const value of ['/pages/1', '#aloqa', 'https://fstu.uz/news', 'mailto:test@fstu.uz', 'tel:+998123456789', 'document.pdf']) assert.equal(sanitizeUrl(value), value);
  assert.equal(sanitizeUrl('data:image/svg+xml;base64,PHN2Zz4=', { allowDataImage: true }), '');
  assert.equal(sanitizeUrl('data:image/png;base64,aGVsbG8=', { allowDataImage: true }), 'data:image/png;base64,aGVsbG8=');
});

test('parses HTML entities and malformed markup before removing scripts and handlers', () => {
  const dirty = '<p onclick="alert(1)">Salom</p><a href="java&#x73;cript:alert(1)">link</a><img src=x onerror=alert(1)><svg onload=alert(1)><script>alert(1)</script></svg><iframe srcdoc="evil">evil</iframe>';
  const clean = sanitizeHtml(dirty);
  assert.match(clean, /<p>Salom<\/p>/);
  assert.doesNotMatch(clean, /javascript|onclick|onerror|onload|script|svg|iframe|srcdoc/i);
});

test('retains editor formatting, tables and safe images while rejecting hostile CSS', () => {
  const clean = sanitizeHtml('<h2 style="text-align:center;color:#123456;background-image:url(javascript:evil)">Title</h2><table><tr><td colspan="2">Cell</td></tr></table><img src="data:image/png;base64,aGVsbG8=" alt="Photo"><a target="_blank" href="https://fstu.uz">Site</a>');
  assert.match(clean, /text-align:center/);
  assert.match(clean, /colspan="2"/);
  assert.match(clean, /data:image\/png;base64/);
  assert.match(clean, /noopener noreferrer/);
  assert.doesNotMatch(clean, /background-image|javascript/);
});

test('structured CMS values cannot introduce prototype properties', () => {
  const cleaned = sanitizeStructuredContent(JSON.parse('{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"content":"<p>Safe</p>"}'));
  assert.equal(Object.hasOwn(cleaned, '__proto__'), false);
  assert.equal(Object.hasOwn(cleaned, 'constructor'), false);
  assert.equal({}.polluted, undefined);
  assert.equal(cleaned.content, '<p>Safe</p>');
});
