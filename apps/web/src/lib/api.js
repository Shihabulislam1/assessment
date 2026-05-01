const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
  const headers = { ...options.headers };
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const hasContentType = Object.keys(headers).some(
    (key) => key.toLowerCase() === 'content-type'
  );
  if (hasBody && !isFormData && !hasContentType) {
    headers['Content-Type'] = 'application/json';
  }

  const method = options.method || 'GET';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error?.message || 'Request failed');
  }

  return res.json();
}

function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match ? match[1] : null;
}