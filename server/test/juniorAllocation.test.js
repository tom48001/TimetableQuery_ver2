import test from 'node:test';
import assert from 'node:assert/strict';
import { juniorClassGroup, juniorRuleAllows } from '../src/utils/juniorAllocation.js';

test('derives odd and even groups from the final class letter', () => {
  assert.equal(juniorClassGroup('1A'), 'odd');
  assert.equal(juniorClassGroup('1B'), 'even');
  assert.equal(juniorClassGroup('2R'), 'even');
  assert.equal(juniorClassGroup('3Y'), 'odd');
  assert.equal(juniorClassGroup('F1'), null);
});

test('applies all, matching, disabled and missing allocation rules', () => {
  assert.equal(juniorRuleAllows({ class_group: 'all' }, 'odd'), true);
  assert.equal(juniorRuleAllows({ class_group: 'even' }, 'even'), true);
  assert.equal(juniorRuleAllows({ class_group: 'odd' }, 'even'), false);
  assert.equal(juniorRuleAllows({ class_group: 'disabled' }, 'odd'), false);
  assert.equal(juniorRuleAllows(null, 'odd'), false);
});
