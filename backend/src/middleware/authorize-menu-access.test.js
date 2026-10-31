import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizeSettingWrite } from './authorize-menu-access.js';

function authorize(user, key = 'university-rankings') {
  let result;
  authorizeSettingWrite({ params: { key }, user }, {}, (error) => { result = error; });
  return result;
}

test('super admin can save rankings through the settings API', () => {
  assert.equal(authorize({ role: 'super_admin' }), undefined);
});

test('rankings editors can save only with the rankings menu permission', () => {
  assert.equal(authorize({ role: 'editor', menuAccess: ['rankings-management'] }), undefined);
  assert.equal(authorize({ role: 'editor', menuAccess: ['advantages-management'] })?.statusCode, 403);
  assert.equal(authorize({ role: 'editor', menuAccess: [] })?.statusCode, 403);
});

test('unknown settings and unauthenticated users remain denied', () => {
  assert.equal(authorize({ role: 'super_admin' }, 'unknown-setting')?.statusCode, 403);
  assert.equal(authorize(null)?.statusCode, 403);
});

test('academic structure settings use their own menu permission', () => {
  assert.equal(authorize({ role: 'super_admin' }, 'academic-structure'), undefined);
  assert.equal(authorize({ role: 'editor', menuAccess: ['academic-structure-management'] }, 'academic-structure'), undefined);
  assert.equal(authorize({ role: 'editor', menuAccess: ['academic-menu-management'] }, 'academic-structure')?.statusCode, 403);
});
