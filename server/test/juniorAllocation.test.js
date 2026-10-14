import test from 'node:test';
import assert from 'node:assert/strict';
import { juniorStudentGroup, juniorRuleAllows } from '../src/utils/juniorAllocation.js';

test('derives groups from student numbers including leading zeros', () => {
  for (const value of ['01', '03', 15]) assert.equal(juniorStudentGroup(value), 'odd');
  for (const value of ['02', '04', 20]) assert.equal(juniorStudentGroup(value), 'even');
  for (const value of ['', null, undefined, '1A', '0', '-1', '1.5']) assert.equal(juniorStudentGroup(value), null);
});

test('applies all, matching, disabled and missing allocation rules', () => {
  assert.equal(juniorRuleAllows({ class_group: 'all' }, 'odd'), true);
  assert.equal(juniorRuleAllows({ class_group: 'even' }, 'even'), true);
  assert.equal(juniorRuleAllows({ class_group: 'odd' }, 'even'), false);
  assert.equal(juniorRuleAllows({ class_group: 'disabled' }, 'odd'), false);
  assert.equal(juniorRuleAllows(null, 'odd'), false);
});
