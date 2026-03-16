import express from "express";
import {
  updateProfile,
  uploadResume,
  getRecommendedJobs,
  applyToJob,
  getMyApplications,
  getProfile,
} from "../controllers/studentController";
import { protect, authorize } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();



router.use(protect);
router.use(authorize("student"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/upload-resume", upload.single("resume"), uploadResume);
router.get("/recommended-jobs", getRecommendedJobs);
router.post("/apply", applyToJob);
router.get("/applications", getMyApplications);

export default router;
