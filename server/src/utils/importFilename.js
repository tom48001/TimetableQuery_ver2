// Multipart headers may decode UTF-8 bytes as Latin-1. Only repair lossless UTF-8.
export function normalizeImportFilename(value) {
  if (typeof value !== 'string' || !/[\u0080-\u00ff]/.test(value) || Array.from(value).some(char => char.codePointAt(0) > 255)) return value;
  const bytes = Buffer.from(value, 'latin1');
  const decoded = bytes.toString('utf8');
  return !decoded.includes('\ufffd') && Buffer.from(decoded, 'utf8').equals(bytes) ? decoded : value;
}

export function normalizeUploadedFilename(req, res, next) {
  if (req.file) req.file.originalname = normalizeImportFilename(req.file.originalname);
  next();
}
