import test from 'node:test';
import assert from 'node:assert/strict';
import { googleDomain, managerEmails, isGoogleEmailAllowed } from '../src/utils/googleAccess.js';

test('school domain accepts optional @ and normalizes case/whitespace', () => {
  assert.equal(googleDomain(' @SMCC.EDU.HK '), 'smcc.edu.hk');
  assert.equal(isGoogleEmailAllowed('Teacher@smcc.edu.hk', '@smcc.edu.hk', []), true);
});

test('only specifically configured managers may bypass the school domain', () => {
  const managers = managerEmails(' Singsing894@gmail.com, ');
  assert.equal(isGoogleEmailAllowed('singsing894@gmail.com', 'smcc.edu.hk', managers), true);
  assert.equal(isGoogleEmailAllowed('someone@gmail.com', 'smcc.edu.hk', managers), false);
  assert.equal(isGoogleEmailAllowed('teacher@smcc.edu.hk.evil.test', 'smcc.edu.hk', managers), false);
  assert.equal(isGoogleEmailAllowed('teacher@fakesmcc.edu.hk', 'smcc.edu.hk', managers), false);
  assert.equal(isGoogleEmailAllowed('', 'smcc.edu.hk', managers), false);
});
