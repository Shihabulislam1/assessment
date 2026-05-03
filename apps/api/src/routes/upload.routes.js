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
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Validation('Only images are allowed'), false);
    }
  },
});

const validateFileSignature = (req, res, next) => {
  if (!req.file) return next();

  const buffer = req.file.buffer;
  if (!buffer || buffer.length < 4) {
    return next(new Validation('Invalid file content'));
  }

  // Check magic bytes
  const header = buffer.toString('hex', 0, 4).toUpperCase();
  const isJpeg = header.startsWith('FFD8FF');
  const isPng = header === '89504E47';
  const isGif = header === '47494638';
  const isWebp = buffer.toString('utf8', 8, 12) === 'WEBP'; // RIFF....WEBP

  if (isJpeg || isPng || isGif || isWebp) {
    next();
  } else {
    next(new Validation('File signature does not match allowed image types'));
  }
};

router.use(requireAuth);

router.post('/avatar', upload.single('image'), validateFileSignature, uploadController.uploadAvatar);
router.post('/workspace/:workspaceId/image', upload.single('image'), validateFileSignature, uploadController.uploadWorkspaceImage);

export default router;
