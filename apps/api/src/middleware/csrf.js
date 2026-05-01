import crypto from 'crypto';
import { Forbidden } from '../utils/AppError.js';

const CSRF_COOKIE_DOMAIN = process.env.CSRF_COOKIE_DOMAIN || '';
const VALID_SAMESITE = ['lax', 'strict', 'none'];
const ENV_SAMESITE = process.env.CSRF_COOKIE_SAMESITE || 'lax';
const CSRF_COOKIE_SAMESITE = VALID_SAMESITE.includes(ENV_SAMESITE)
  ? ENV_SAMESITE
  : (() => { console.warn(`[CSRF] Invalid CSRF_COOKIE_SAMESITE="${ENV_SAMESITE}", falling back to "lax"`); return 'lax'; })();

const ENV_SECURE = process.env.CSRF_COOKIE_SECURE;
const CSRF_COOKIE_SECURE = ENV_SECURE !== undefined
  ? ENV_SECURE === 'true' || ENV_SECURE === '1'
  : process.env.NODE_ENV === 'production';

const ENV_TOKEN_LEN_STR = (process.env.CSRF_TOKEN_LENGTH || '').trim();
const ENV_TOKEN_LEN = parseInt(ENV_TOKEN_LEN_STR, 10);
if (
  ENV_TOKEN_LEN_STR === '' ||
  !Number.isInteger(ENV_TOKEN_LEN) ||
  ENV_TOKEN_LEN < 32 ||
  ENV_TOKEN_LEN % 2 !== 0 ||
  /^\d+\.\d+$/.test(ENV_TOKEN_LEN_STR)
) {
  throw new Error(`Missing or invalid CSRF_TOKEN_LENGTH env (must be even integer >= 32, got: "${process.env.CSRF_TOKEN_LENGTH}")`);
}
const CSRF_TOKEN_BYTES = ENV_TOKEN_LEN / 2;
export const CSRF_TOKEN_LENGTH = ENV_TOKEN_LEN;

export const generateCsrfToken = () => {
  return crypto.randomBytes(CSRF_TOKEN_BYTES).toString('hex');
};

const buildCsrfCookieOptions = () => ({
  httpOnly: false,
  secure: CSRF_COOKIE_SECURE,
  sameSite: CSRF_COOKIE_SAMESITE,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
  ...(CSRF_COOKIE_DOMAIN && { domain: CSRF_COOKIE_DOMAIN }),
});

export const setCsrfCookie = (res, token) => {
  res.cookie('csrf_token', token, buildCsrfCookieOptions());
};

export const clearCsrfCookie = (res) => {
  res.clearCookie('csrf_token', { ...buildCsrfCookieOptions(), maxAge: 0 });
};

export const csrfProtect = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    return next(new Forbidden('CSRF token missing'));
  }

  if (cookieToken.length !== CSRF_TOKEN_LENGTH || headerToken.length !== CSRF_TOKEN_LENGTH) {
    return next(new Forbidden('CSRF token mismatch'));
  }

  const cookieBuf = Buffer.from(cookieToken, 'utf8');
  const headerBuf = Buffer.from(headerToken, 'utf8');

  if (!crypto.timingSafeEqual(cookieBuf, headerBuf)) {
    return next(new Forbidden('CSRF token mismatch'));
  }

  next();
};