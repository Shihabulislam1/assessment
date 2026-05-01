const cors = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
};

export default cors;
