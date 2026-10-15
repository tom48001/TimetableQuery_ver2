import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function componentHarness(states, onDelay) {
  const source = fs.readFileSync(new URL('../../client/src/pages/SubMenu3/ImportTeacher.vue', import.meta.url), 'utf8');
  const script = source.split('<script>')[1].split('</script>')[0]
    .replace("import axios from 'axios';", '').replace('export default', 'globalThis.component =');
  const requested = [];
  const requestConfigs = [];
  const percentages = [];
  let instance;
  class Cancel extends Error {}
  const axios = {
    Cancel,
    isCancel: error => error instanceof Cancel,
    CancelToken: { source: () => ({ token: {}, cancel() {} }) },
    post: async () => ({ data: { jobId: 'job-1', status: 'pending', processedRows: 0, totalRows: 0 } }),
    get: async (url, config) => {
      requested.push(url);
      requestConfigs.push(config);
      const state = states.shift();
      if (state instanceof Error) throw state;
      if (!state) throw new Error('Unexpected extra poll');
      return { data: state };
    }
  };
  const context = vm.createContext({
    axios, console, localStorage: { getItem: () => 'test-token' },
    clearTimeout,
    setTimeout(callback, delay) {
      assert.equal(delay, 750);
      if (onDelay) return setTimeout(() => onDelay(instance, context.component), 0);
      return setTimeout(callback, 0);
    }
  });
  vm.runInContext(script, context);
  const component = context.component;
  instance = { ...component.data(), $lang: { locale: 'zh' } };
  for (const [key, method] of Object.entries(component.methods)) instance[key] = method.bind(instance);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(instance, key, { get: getter.bind(instance) });
  let progress;
  Object.defineProperty(instance, 'importProgress', {
    get: () => progress,
    set(value) { progress = value; percentages.push(instance.importPercentage); }
  });
  return { instance, requested, requestConfigs, percentages, Cancel };
}

test('UI polls real counts, stays still for unchanged counts and stops at success', async () => {
  const state = processedRows => ({ jobId: 'job-1', status: 'processing', totalRows: 10, processedRows });
  const harness = componentHarness([
    state(0), state(5), state(5), { ...state(10), status: 'success', result: { batchId: 7 } }
  ]);
  const result = await harness.instance.runImport('/api/import/csv', {}, {});
  assert.equal(result.data.batchId, 7);
  assert.deepEqual(harness.percentages, [0, 0, 0, 50, 50, 100]);
  assert.equal(harness.requested.length, 4);
  assert.equal(harness.instance.progressLabel, '導入完成');
});

test('UI preserves backend failure details and stops polling at failed row count', async () => {
  const harness = componentHarness([{
    jobId: 'job-1', status: 'failed', totalRows: 10, processedRows: 4,
    errorMessage: 'Missing class', result: { message: 'Missing class', missingClasses: ['unknown'] }
  }]);
  await assert.rejects(harness.instance.runImport('/api/import/csv', {}, {}), error => {
    assert.equal(error.response.data.missingClasses[0], 'unknown');
    return true;
  });
  assert.equal(harness.instance.importPercentage, 40);
  assert.equal(harness.instance.progressLabel, '導入失敗');
  assert.equal(harness.requested.length, 1);
});

test('UI reports polling errors without pretending the server job failed', async () => {
  const harness = componentHarness([new Error('Network unavailable')]);
  await assert.rejects(harness.instance.runImport('/api/import/csv', {}, {}));
  assert.match(harness.instance.progressError, /後端可能仍在導入/);
  assert.equal(harness.instance.importProgress.status, 'pending');
  assert.equal(harness.requested.length, 1);
});

test('leaving the page cancels the polling loop', async () => {
  const harness = componentHarness([{
    jobId: 'job-1', status: 'processing', totalRows: 10, processedRows: 2
  }], (instance, component) => component.beforeDestroy.call(instance));
  await assert.rejects(harness.instance.runImport('/api/import/csv', {}, {}), harness.Cancel);
  assert.equal(harness.requested.length, 1);
});

test('student, elective and legacy history request distinct server categories', async () => {
  const harness = componentHarness([[], [], []]);
  const instance = harness.instance;
  instance.userRole = 'manager';
  instance.activeTab = 'students';
  await instance.fetchStudentImportBatches();
  instance.activeTab = 'studentRoster';
  await instance.fetchStudentImportBatches();
  instance.showLegacyStudentHistory = true;
  await instance.fetchStudentImportBatches();
  assert.deepEqual(harness.requestConfigs.map(config => config.params.kind), ['students', 'electives', 'legacy']);
});
