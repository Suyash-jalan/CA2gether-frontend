const apiBase = import.meta.env.VITE_API_URL || '/api';

export function resolveMediaUrl(value) {
  if (!value || typeof value !== 'string') return '';
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  if (value.startsWith('/uploads/')) {
    try {
      const origin = new URL(apiBase, window.location.origin).origin;
      return `${origin}${value}`;
    } catch {
      return value;
    }
  }

  return value;
}
