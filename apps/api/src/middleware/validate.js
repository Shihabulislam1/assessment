import { z } from 'zod';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: { message: err.errors[0].message } });
      } else {
        next(err);
      }
    }
  };
};