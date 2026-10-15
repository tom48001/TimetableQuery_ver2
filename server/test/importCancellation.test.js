import test from 'node:test';
import assert from 'node:assert/strict';
import { activeImports, cancelOwnImports, cancellableConnection } from '../src/utils/importCancellation.js';

test('only the owner can cancel; commit cannot race with accepted cancellation', async () => {
  const control = { ownerId: 5, cancelled: false, committing: false };
  activeImports.set('test-job', control);
  const res = { json: value => value };
  try {
    assert.equal(cancelOwnImports({ user: { id: 6 }, body: {} }, res).requested, 0);
    const events = [];
    const conn = cancellableConnection({ importControl: control }, {
      query: async sql => events.push(sql),
      rollback: async () => events.push('rollback'),
      commit: async () => events.push('commit'),
      release: () => events.push('release')
    });
    await conn.query('INSERT');
    assert.equal(cancelOwnImports({ user: { id: 5 }, body: { jobId: 'test-job' } }, res).requested, 1);
    await assert.rejects(conn.query('INSERT'), { code: 'IMPORT_CANCELLED' });
    assert.throws(() => conn.commit(), { code: 'IMPORT_CANCELLED' });
    await conn.rollback();
    await conn.query("SELECT RELEASE_LOCK('test')");
    conn.release();
    assert.deepEqual(events, ['INSERT', 'rollback', "SELECT RELEASE_LOCK('test')", 'release']);
    control.cancelled = false;
    await conn.commit();
    assert.equal(cancelOwnImports({ user: { id: 5 }, body: {} }, res).committing, 1);
    assert.equal(control.cancelled, false);
  } finally { activeImports.delete('test-job'); }
});

test('blocked SQL cancellation reports cancellation after lock timeout and allows rollback', async () => {
  const { acquireImportConnection } = await import('../src/utils/importCancellation.js');
  const control = { cancelled: false };
  let rejectQuery;
  const events = [];
  const raw = {
    query(sql) {
      events.push(sql);
      if (sql.startsWith('SET SESSION')) return Promise.resolve();
      return new Promise((resolve, reject) => { rejectQuery = reject; });
    },
    rollback: async () => events.push('rollback'),
    release: () => events.push('release')
  };
  const conn = await acquireImportConnection({ importControl: control }, { getConnection: async () => raw });
  const running = conn.query('ALTER TABLE example ADD COLUMN value INT');
  control.cancelled = true;
  rejectQuery(Object.assign(new Error('Lock timeout'), { code: 'ER_LOCK_WAIT_TIMEOUT' }));
  await assert.rejects(running, { code: 'IMPORT_CANCELLED' });
  await conn.rollback();
  conn.release();
  assert.match(events[0], /lock_wait_timeout = 15, innodb_lock_wait_timeout = 15/);
  assert.deepEqual(events.slice(-2), ['rollback', 'release']);
});
