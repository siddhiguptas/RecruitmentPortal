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
  assignTest,
  updateTest,
  deleteTest,
  getTestResultsByTest,
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

// Assign a test to a job
router.post("/:testId/assign", authorize("recruiter"), assignTest);

// Update/Edit a test
router.put("/:testId", authorize("recruiter"), updateTest);

// Delete a test
router.delete("/:testId", authorize("recruiter"), deleteTest);

// Get results for a specific test (Recruiter only)
router.get("/:testId/results", authorize("recruiter"), getTestResultsByTest);

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