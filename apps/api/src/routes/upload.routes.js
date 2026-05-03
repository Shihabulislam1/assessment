import { Router } from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/upload.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { Validation } from '../utils/AppError.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Validation('Only images are allowed'), false);
    }
  },
});

router.use(requireAuth);

router.post('/avatar', upload.single('image'), uploadController.uploadAvatar);
router.post('/workspace/:workspaceId/image', upload.single('image'), uploadController.uploadWorkspaceImage);

export default router;
