export function googleDomain(value = process.env.GOOGLE_ALLOWED_DOMAIN || 'gmail.com') {
  return String(value).trim().toLowerCase().replace(/^@+/, '');
}

export function managerEmails(value = process.env.MANAGER_EMAILS || '') {
  return String(value).split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
}

export function isGoogleEmailAllowed(email, domain = googleDomain(), managers = managerEmails()) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) return false;
  return managers.includes(normalized) || normalized.split('@').length === 2
    && normalized.split('@')[1] === googleDomain(domain);
}
