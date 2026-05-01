import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../utils/validators/auth.validators.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { csrfProtect } from '../middleware/csrf.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', csrfProtect, authController.refresh);
router.post('/logout', requireAuth, csrfProtect, authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;