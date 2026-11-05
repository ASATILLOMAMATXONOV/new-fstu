import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyNetwork, inspectForwarding, isPublicIp, parseUserAgent } from './security-intel.js';

test('flags forwarded headers that claim a different public address', () => {
  const req = { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'x-real-ip': '9.9.9.9', via: '1.1 proxy' } };
  const result = inspectForwarding(req, '203.0.113.50');
  assert.equal(result.spoofAttempt, true);
  assert.deepEqual(result.fakeIps, ['1.2.3.4', '5.6.7.8', '9.9.9.9']);
  assert.match(result.claims, /x-forwarded-for: 1\.2\.3\.4/);
});

test('does not flag headers that only repeat the real address or trusted proxies', () => {
  const app = { get: () => (ip) => ip === '10.0.0.5' };
  const req = { app, headers: { 'x-forwarded-for': '203.0.113.50, 10.0.0.5', forwarded: 'for="[2001:db8::1]";proto=https' } };
  const result = inspectForwarding(req, '203.0.113.50');
  assert.deepEqual(result.fakeIps, ['2001:db8::1']);
  assert.equal(inspectForwarding({ headers: { 'x-forwarded-for': '203.0.113.50' } }, '203.0.113.50').spoofAttempt, false);
});

test('classifies networks and keeps VPN locations explicit', () => {
  assert.equal(isPublicIp('10.1.2.3'), false);
  assert.equal(isPublicIp('8.8.8.8'), true);
  assert.equal(classifyNetwork({ isp: 'NordVPN', org: '', asName: '', reverseDns: '' }).type, 'vpn');
  assert.equal(classifyNetwork({ isp: 'Hetzner Online GmbH', org: '', asName: '', reverseDns: '' }).type, 'hosting');
  assert.equal(classifyNetwork({ isp: 'X', org: '', asName: '', reverseDns: '', proxy: true }, { tor: true }).type, 'tor');
  assert.equal(classifyNetwork({ isp: 'Uztelecom', org: '', asName: '', reverseDns: '', mobile: true }).type, 'mobile');
  assert.equal(classifyNetwork(null).type, 'unknown');
});

test('recognises attack tools and regular browsers from the user agent', () => {
  assert.equal(parseUserAgent('sqlmap/1.7.2#stable').tool, 'sqlmap');
  assert.equal(parseUserAgent('').automated, true);
  const browser = parseUserAgent('Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36');
  assert.equal(browser.os, 'Android 14');
  assert.equal(browser.device, 'Telefon');
  assert.equal(browser.automated, false);
});
