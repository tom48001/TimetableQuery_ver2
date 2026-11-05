const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('anonymous bootstrap and expired sessions navigate without reloading the document', async () => {
  let rejectResponse;
  let redirects = 0;
  let reloads = 0;
  let route = '/home';
  const values = new Map([['user', '{"id":1}']]);
  const axios = {
    defaults: {},
    interceptors: {
      request: { use() {} },
      response: { use(resolve, reject) { rejectResponse = reject; } }
    },
    get(url) { return rejectResponse({ response: { status: 401, data: {} }, config: { url } }); }
  };
  const context = {
    axios, URL,
    apiUrl: path => '/api' + path,
    localStorage: {
      removeItem: key => values.delete(key),
      setItem: (key, value) => values.set(key, value)
    },
    window: { location: { origin: 'http://localhost:3000', pathname: '/', replace() { reloads++; } } }
  };
  const source = fs.readFileSync(path.join(__dirname, '../../src/config/session.js'), 'utf8')
    .replace(/^import .*$/gm, '').replace(/export /g, '');
  vm.runInNewContext(source, context);
  context.setSessionExpiredHandler(() => {
    if (route !== '/login') { route = '/login'; redirects++; }
  });
  assert.equal(await context.refreshSession(), null);
  assert.equal(route, '/login');
  assert.equal(values.has('user'), false);
  assert.equal(await context.refreshSession(), null);
  assert.equal(redirects, 1);
  assert.equal(reloads, 0);
  route = '/home';
  await assert.rejects(axios.get('/api/timetable'));
  assert.equal(route, '/login');
  assert.equal(reloads, 0);
  route = '/login';
  const before = redirects;
  await assert.rejects(axios.get('/api/auth/login'));
  assert.equal(redirects, before);
});
