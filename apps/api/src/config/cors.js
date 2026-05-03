const parseOrigins = (envValue) => {
  if (!envValue) return ['http://localhost:3000'];
  return envValue.split(',').map((o) => o.trim()).filter(Boolean);
};

const ALLOWED_ORIGINS = parseOrigins(process.env.CLIENT_URL);

export const isOriginAllowed = (origin) => {
  return ALLOWED_ORIGINS.includes(origin);
};

// Express CORS middleware (used with cors() package)
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

// Socket.IO CORS config — uses the plain-object format Socket.IO expects.
// The `origin` field accepts a function with (origin, callback) signature.
export const socketCorsConfig = {
  origin: (origin, callback) => {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};