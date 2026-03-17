import express from "express";
import {
  getAvailableTests,
  getTestDetails,
  startTest,
  submitTest,
  getTestResults,
  saveAnswer,
  getAttemptResult,
  getOngoingAttempts,
  autoSubmitTest,
  createTest,
  getRecruiterTests,
} from "../controllers/testController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);
router.use(authorize("student", "recruiter", "admin"));

// Get all available tests (for students)
router.get("/", getAvailableTests);

// Get recruiter tests
router.get("/recruiter", authorize("recruiter"), getRecruiterTests);

// Create a new test (Recruiter only)
router.post("/", authorize("recruiter"), createTest);

// Get test history and results
router.get("/results/all", getTestResults);

// Get ongoing test attempts
router.get("/ongoing/list", getOngoingAttempts);

// Get specific test details
router.get("/:testId", getTestDetails);

// Get detailed result for a specific attempt
router.get("/attempt/:attemptId/result", getAttemptResult);

// Start a test
router.post("/:testId/start", startTest);

// Save answer while taking test
router.post("/:attemptId/save-answer", saveAnswer);

// Submit test
router.post("/:attemptId/submit", submitTest);

// Auto-submit when timer expires
router.post("/:attemptId/auto-submit", autoSubmitTest);

export default router;