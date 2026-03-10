import express from "express";
import {
  getAvailableTests,
  getTestDetails,
  startTest,
  submitTest,
  getTestResults,
} from "../controllers/testController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);
router.use(authorize("student"));

router.get("/", getAvailableTests);
router.get("/results", getTestResults);
router.get("/:testId", getTestDetails);
router.post("/:testId/start", startTest);
router.post("/:testId/submit", submitTest);

export default router;