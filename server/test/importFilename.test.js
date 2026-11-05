import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeImportFilename } from '../src/utils/importFilename.js';
test('repairs multipart mojibake and preserves valid names', () => {
  const name = '2627_學生名單與選修名單_(2026-9-4).xlsx';
  assert.equal(normalizeImportFilename(Buffer.from(name).toString('latin1')), name);
  for (const original of [name, 'Details.csv', 'élèves.xlsx', undefined]) assert.equal(normalizeImportFilename(original), original);
});
