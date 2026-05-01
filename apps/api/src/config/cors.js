const parseOrigins = (envValue) => {
  if (!envValue) return ['http://localhost:3000'];
  return envValue.split(',').map((o) => o.trim()).filter(Boolean);
};

const ALLOWED_ORIGINS = parseOrigins(process.env.CLIENT_URL);

export const isOriginAllowed = (origin) => {
  return ALLOWED_ORIGINS.includes(origin);
};

export default (req, callback) => {
  const origin = req.headers.origin;

  if (!origin) {
    return callback(null, { origin: false, credentials: false });
  }

  if (isOriginAllowed(origin)) {
    callback(null, { origin, credentials: true });
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};