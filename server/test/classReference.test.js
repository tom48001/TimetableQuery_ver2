import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeLevelForClass } from '../src/utils/classReference.js';

test('recognizes split-class references while retaining their original identity', () => {
  for (const name of ['#6R/6Y', '#6A/6M', '# 6R ／ 6Y', '6R/6Y', '6A,6M']) {
    assert.equal(gradeLevelForClass(name), 'F6', name);
  }
});

test('recognizes ordinary classes and form-wide references', () => {
  for (const name of ['6R', 's6', 'F6', 'S6R', '6', ' 6y ']) {
    assert.equal(gradeLevelForClass(name), 'F6', name);
  }
  assert.equal(gradeLevelForClass('1M'), 'F1');
});

test('does not create references with malformed or mixed-grade components', () => {
  for (const name of ['', null, '#', '#6R/', '#6R/unknown', '#6R/5Y', '16R', '7A', '6R??']) {
    assert.equal(gradeLevelForClass(name), '', String(name));
  }
});
