export function safeRedirectPath(value?: string | null, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;

  try {
    const url = new URL(value, 'https://acs.local');
    if (url.origin !== 'https://acs.local') return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
