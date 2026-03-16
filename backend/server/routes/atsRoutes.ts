import express from 'express';
import multer from 'multer';
import { parseResume } from '../controllers/atsController';

const router = express.Router();
const upload = multer({
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }
    cb(new Error("Only PDF documents are allowed") as any, false);
  },
});

router.post('/upload-resume', upload.single('resume'), parseResume);

export default router;
