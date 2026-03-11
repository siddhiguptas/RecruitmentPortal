import express from "express";
import {
  getPlacementAnalytics,
  verifyStudentEligibility,
  predictStudentPlacement,
  getAllJobs,
  getAllStudents,
  getAllRecruiters,
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

export default router;
