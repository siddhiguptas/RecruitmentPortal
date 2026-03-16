import express from "express";
import {
  postJob,
  getMyJobs,
  getApplicants,
  rankCandidates,
  updateApplicationStatus,
  scheduleInterview,
  getAllApplications,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadLogo
} from "../controllers/recruiterController";
import { protect, authorize } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

router.use(protect);
router.use(authorize("recruiter"));

router.post("/jobs", postJob);
router.get("/jobs", getMyJobs);
router.get("/jobs/:jobId/applicants", getApplicants);

// return all applications for jobs owned by the authenticated recruiter
router.get("/applications", getAllApplications);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/upload-profile-photo", upload.single("photo"), uploadProfilePhoto);
router.post("/upload-logo", upload.single("logo"), uploadLogo);

router.post("/jobs/:jobId/rank", rankCandidates);
router.put("/applications/:applicationId/status", updateApplicationStatus);
router.post("/interviews", scheduleInterview);

export default router;
