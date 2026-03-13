import express from "express";
import {
  postJob,
  getMyJobs,
  getApplicants,
  rankCandidates,
  updateApplicationStatus,
  scheduleInterview,
  getAllApplications
} from "../controllers/recruiterController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);
router.use(authorize("recruiter"));

router.post("/jobs", postJob);
router.get("/jobs", getMyJobs);
router.get("/jobs/:jobId/applicants", getApplicants);

// return all applications for jobs owned by the authenticated recruiter
router.get("/applications", getAllApplications);

router.post("/jobs/:jobId/rank", rankCandidates);
router.put("/applications/:applicationId/status", updateApplicationStatus);
router.post("/interviews", scheduleInterview);

export default router;
