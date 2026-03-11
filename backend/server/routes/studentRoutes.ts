import express from "express";
import multer from "multer";
import path from "path";
import {
  updateProfile,
  uploadResume,
  getRecommendedJobs,
  applyToJob,
  getMyApplications,
  getProfile,
} from "../controllers/studentController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

// Multer configuration for resume upload
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req: any, file: any, cb: any) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error("Only PDF and Word documents are allowed") as any, false);
  },
});

router.use(protect);
router.use(authorize("student"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/upload-resume", upload.single("resume"), uploadResume);
router.get("/recommended-jobs", getRecommendedJobs);
router.post("/apply", applyToJob);
router.get("/applications", getMyApplications);

export default router;
