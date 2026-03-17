import express from "express";
import {
  getPlacementAnalytics,
  verifyStudentEligibility,
  predictStudentPlacement,
  getAllJobs,
  getAllStudents,
  getAllRecruiters,
  getAllTests,
  updateTest,
  deleteTest,
  getAdminTestResults,
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/analytics", getPlacementAnalytics);
router.get("/students", getAllStudents);
router.get("/recruiters", getAllRecruiters);
router.put("/students/:studentId/eligibility", verifyStudentEligibility);
router.post("/students/:studentId/predict-placement", predictStudentPlacement);
router.get("/jobs", getAllJobs);

// Admin Test Routes
router.get("/tests", getAllTests);
router.put("/tests/:id", updateTest);
router.delete("/tests/:id", deleteTest);
router.get("/tests/:id/results", getAdminTestResults);

export default router;
