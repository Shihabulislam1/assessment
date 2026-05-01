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
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error?.message || 'Request failed');
  }

  return res.json();
}