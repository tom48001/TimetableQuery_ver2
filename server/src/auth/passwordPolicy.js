// bcrypt accepts at most 72 UTF-8 bytes; never silently truncate passwords.
export function passwordError(value) {
  if (typeof value !== 'string' || !value.length) {
    return '請輸入密碼。Please enter a password.';
  }
  if (Buffer.byteLength(value, 'utf8') > 72) {
    return '密碼超過 bcrypt 的 72 UTF-8 bytes 技術限制。Password exceeds the bcrypt limit of 72 UTF-8 bytes.';
  }
  return null;
}
