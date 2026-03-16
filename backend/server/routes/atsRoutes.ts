import express from 'express';
import { parseResume } from '../controllers/atsController';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/upload-resume', upload.single('resume'), parseResume);

export default router;
