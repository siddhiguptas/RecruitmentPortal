import express from 'express';
import multer from 'multer';
import { parseResume } from '../controllers/atsController';

const router = express.Router();
const upload = multer();

router.post('/upload-resume', upload.single('resume'), parseResume);

export default router;
