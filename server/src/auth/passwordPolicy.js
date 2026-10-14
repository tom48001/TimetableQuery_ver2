// bcrypt accepts at most 72 UTF-8 bytes; never silently truncate passwords.
export function passwordError(value) {
  if (typeof value !== 'string' || [...value].length < 15 || Buffer.byteLength(value, 'utf8') > 72) {
    return '密碼須至少 15 個字元，且不超過 72 UTF-8 bytes。Password must contain at least 15 characters and at most 72 UTF-8 bytes.';
  }
  if (/^(.)\1+$/u.test(value) || ['passwordpassword', '123456789012345', 'qwertyuiopasdfgh', 'letmeinletmeinletmein'].includes(value.toLowerCase())) {
    return '請使用較難猜測的密碼片語。Please choose a less predictable passphrase.';
  }
  return null;
}
