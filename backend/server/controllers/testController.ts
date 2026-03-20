import { Response } from "express";
import mongoose from "mongoose";
import { Test } from "../models/Test";
import { TestAttempt } from "../models/TestAttempt";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { AuthRequest } from "../types";

/**
 * Get all available tests (for students)
 */
export const getAvailableTests = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find({ student: req.user._id }).select('job');
    const appliedJobIds = applications.map(app => app.job);

    const tests = await Test.find({
      isActive: true,
      $or: [
        { startTime: { $exists: false } },
        { startTime: { $lte: new Date() } }
      ],
      $and: [
        {
          $or: [
            { jobs: { $exists: false } },
            { jobs: { $size: 0 } },
            { jobs: { $in: appliedJobIds } }
          ]
        }
      ]
    }).populate('createdBy', 'name').select('title company type duration totalQuestions difficulty deadline passingScore createdAt jobs');

    res.json(tests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get tests created by the recruiter
 */
export const getRecruiterTests = async (req: AuthRequest, res: Response) => {
  try {
    const tests = await Test.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(tests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Get test details by ID with questions (without correct answers)
 */
export const getTestDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Check if student has already attempted this test
    const existingAttempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id
    });

    if (existingAttempt && existingAttempt.status === 'completed') {
      return res.status(400).json({ message: "You have already completed this test. Retakes are not allowed." });
    }

    // Return test data based on type - hide correct answers
    const testData = {
      _id: test._id,
      title: test.title,
      company: test.company,
      type: test.type,
      description: test.description,
      duration: test.duration,
      totalQuestions: test.totalQuestions,
      difficulty: test.difficulty,
      deadline: test.deadline,
      passingScore: test.passingScore
    };

    if (test.type === 'MCQ') {
      (testData as any).questions = test.questions?.map(q => ({
        questionText: q.questionText,
        options: q.options,
        marks: q.marks || 1
      }));
    } else if (test.type === 'Coding') {
      (testData as any).codingProblems = test.codingProblems?.map(p => ({
        title: p.title,
        description: p.description,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: p.constraints,
        examples: p.examples,
        marks: p.marks || 10
      }));
    }

    res.json({
      test: testData,
      hasAttempt: !!existingAttempt,
      attemptId: existingAttempt?._id
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Start test - create or resume a test attempt
 */
export const startTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      console.log("🚨 Start Test Rejected:", "Invalid test ID");
      return res.status(400).json({ message: "Invalid test ID" });
    }

    // Check if test exists and is active
    const test = await Test.findById(testId);
    if (!test || !test.isActive) {
      return res.status(404).json({ message: "Test not found or inactive" });
    }

    if (test.type === 'MCQ' && (!test.questions || test.questions.length === 0)) {
      console.log("🚨 Start Test Rejected:", "Cannot start test: This test has no questions");
      return res.status(400).json({ message: "Cannot start test: This test has no questions" });
    }

    if (test.type === 'Coding' && (!test.codingProblems || test.codingProblems.length === 0)) {
      console.log("🚨 Start Test Rejected:", "Cannot start test: This test has no coding problems");
      return res.status(400).json({ message: "Cannot start test: This test has no coding problems" });
    }

    // Check for completed attempt
    const completedAttempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id,
      status: 'completed'
    });

    if (completedAttempt) {
      console.log("🚨 Start Test Rejected:", "Test already completed. Retakes are not allowed.");
      return res.status(400).json({ message: "Test already completed. Retakes are not allowed." });
    }

    // Check for existing in-progress attempt
    let attempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id,
      status: 'in_progress'
    });

    // If no in-progress attempt, create a new one
    if (!attempt) {
      const initialAnswers = test.type === 'MCQ'
        ? test.questions.map((_, idx) => ({
          questionIndex: idx,
          selectedAnswer: undefined,
          timeSpent: 0,
          isCorrect: false
        }))
        : [];

      const initialCodingAnswers = test.type === 'Coding'
        ? test.codingProblems.map((_, idx) => ({
          problemIndex: idx,
          code: "",
          language: "javascript",
          timeSpent: 0,
          testResults: [],
          score: 0
        }))
        : [];

      attempt = await TestAttempt.create({
        test: testId,
        student: req.user._id,
        status: 'in_progress',
        startedAt: new Date(),
        mcqAnswers: initialAnswers,
        codingAnswers: initialCodingAnswers
      });
    }

    // Return test and attempt info
    const testData = {
      _id: test._id,
      title: test.title,
      company: test.company,
      type: test.type,
      description: test.description,
      duration: test.duration,
      totalQuestions: test.totalQuestions,
      difficulty: test.difficulty,
      passingScore: test.passingScore
    };

    if (test.type === 'MCQ') {
      (testData as any).questions = test.questions?.map(q => ({
        questionText: q.questionText,
        options: q.options,
        marks: q.marks || 1
      }));
    } else if (test.type === 'Coding') {
      (testData as any).codingProblems = test.codingProblems?.map(p => ({
        title: p.title,
        description: p.description,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: p.constraints,
        examples: p.examples,
        marks: p.marks || 10
      }));
    }

    const durationMs = (test.duration || 0) * 60 * 1000;
    const expiresAt = new Date(new Date(attempt.startedAt).getTime() + durationMs);
    const now = Date.now();
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now) / 1000));

    res.json({
      attemptId: attempt._id,
      test: testData,
      startedAt: attempt.startedAt,
      timeRemaining: timeRemaining
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Save answer to a question (auto-save while taking test)
 */
export const saveAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { type, questionIndex, answer, timeSpent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: "Invalid attempt ID" });
    }

    const testAttempt = await TestAttempt.findById(attemptId);

    if (!testAttempt) {
      return res.status(404).json({ message: "Test attempt not found" });
    }

    if (testAttempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (testAttempt.status !== "in_progress") {
      return res.status(400).json({ message: "Test is no longer in progress" });
    }

    if (type === "mcq") {
      if (questionIndex >= 0 && questionIndex < testAttempt.mcqAnswers.length) {
        testAttempt.mcqAnswers[questionIndex].selectedAnswer = answer;
        testAttempt.mcqAnswers[questionIndex].timeSpent = timeSpent;
      }
    } else if (type === "coding") {
      if (questionIndex >= 0 && questionIndex < testAttempt.codingAnswers.length) {
        testAttempt.codingAnswers[questionIndex].code = answer;
        testAttempt.codingAnswers[questionIndex].timeSpent = timeSpent;
      }
    }

    await testAttempt.save();

    res.json({ message: "Answer saved successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Submit test and calculate score
 */
export const submitTest = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: "Invalid attempt ID" });
    }

    const testAttempt = await TestAttempt.findById(attemptId).populate("test");

    if (!testAttempt) {
      return res.status(404).json({ message: "Test attempt not found" });
    }

    if (testAttempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (testAttempt.status !== "in_progress") {
      return res.status(400).json({ message: "Test is no longer in progress" });
    }

    const test = testAttempt.test as any;
    let totalScore = 0;
    let totalMarks = 0;

    // Calculate MCQ Score
    if (test.type === "MCQ" && testAttempt.mcqAnswers) {
      let mcqScore = 0;
      let mcqTotalMarks = 0;

      testAttempt.mcqAnswers.forEach((answer: any, idx: number) => {
        const question = test.questions[idx];
        const questionMarks = question.marks || 1;
        mcqTotalMarks += questionMarks;

        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        testAttempt.mcqAnswers[idx].isCorrect = isCorrect;

        if (isCorrect) {
          mcqScore += questionMarks;
        }
      });

      testAttempt.mcqScore = mcqScore;
      totalScore = mcqScore;
      totalMarks = mcqTotalMarks;
    }

    // Calculate Coding Score
    if (test.type === "Coding" && testAttempt.codingAnswers) {
      let codingScore = 0;
      let codingTotalMarks = 0;

      testAttempt.codingAnswers.forEach((answer: any, idx: number) => {
        const problem = test.codingProblems[idx];
        const problemMarks = problem.marks || 10;
        codingTotalMarks += problemMarks;

        // For demo: score based on code submission
        let score = 0;
        if (answer.code && answer.code.trim().length > 20) {
          score = Math.round(problemMarks * 0.5); // 50% for attempting
        }
        codingScore += score;
        testAttempt.codingAnswers[idx].score = score;
      });

      testAttempt.codingScore = codingScore;
      totalScore = codingScore;
      totalMarks = codingTotalMarks;
    }

    // Calculate total percentage
    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    testAttempt.totalScore = totalScore;
    testAttempt.percentage = Math.round(percentage);
    testAttempt.passed = percentage >= test.passingScore;
    testAttempt.status = "completed";
    testAttempt.submittedAt = new Date();
    testAttempt.timeTaken = testAttempt.startedAt
      ? Math.round((new Date().getTime() - new Date(testAttempt.startedAt).getTime()) / 60000)
      : 0;

    await testAttempt.save();

    res.json({
      message: "Test submitted successfully",
      attemptId: testAttempt._id,
      result: {
        totalScore,
        totalMarks,
        percentage: testAttempt.percentage,
        passed: testAttempt.passed,
        timeTaken: testAttempt.timeTaken
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get test results for a student
 */
export const getTestResults = async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await TestAttempt.find({
      student: req.user._id,
      status: "completed"
    }).populate('test', 'title company type difficulty duration passingScore')
      .sort({ submittedAt: -1 });

    res.json(attempts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get detailed result for a specific test attempt
 */
export const getAttemptResult = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: "Invalid attempt ID" });
    }

    const testAttempt = await TestAttempt.findById(attemptId).populate("test");

    if (!testAttempt) {
      return res.status(404).json({ message: "Test attempt not found" });
    }

    if (testAttempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const test = testAttempt.test as any;

    // Prepare detailed results with explanations
    const detailedResults: any = {
      test,
      attemptId: testAttempt._id,
      totalScore: testAttempt.totalScore,
      percentage: testAttempt.percentage,
      passed: testAttempt.passed,
      timeTaken: testAttempt.timeTaken,
      submittedAt: testAttempt.submittedAt,
      answers: null
    };

    if (test.type === "MCQ") {
      detailedResults.answers = testAttempt.mcqAnswers.map((answer: any, idx: number) => ({
        questionIndex: idx,
        questionText: test.questions[idx].questionText,
        options: test.questions[idx].options,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: test.questions[idx].correctAnswer,
        isCorrect: answer.isCorrect,
        explanation: test.questions[idx].explanation,
        marks: test.questions[idx].marks || 1,
        timeSpent: answer.timeSpent
      }));
    } else if (test.type === "Coding") {
      detailedResults.answers = testAttempt.codingAnswers.map((answer: any, idx: number) => ({
        problemIndex: idx,
        title: test.codingProblems[idx].title,
        description: test.codingProblems[idx].description,
        code: answer.code,
        language: answer.language,
        score: answer.score,
        marks: test.codingProblems[idx].marks || 10,
        timeSpent: answer.timeSpent
      }));
    }

    res.json(detailedResults);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get ongoing test attempts for a student
 */
export const getOngoingAttempts = async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await TestAttempt.find({
      student: req.user._id,
      status: "in_progress"
    }).populate("test", "title company duration")
      .sort({ startedAt: -1 });

    res.json(attempts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Auto-submit test when timer expires
 */
export const autoSubmitTest = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: "Invalid attempt ID" });
    }

    // Call submitTest function
    await submitTest(req, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new test (Recruiter only)
 */
export const createTest = async (req: AuthRequest, res: Response) => {
  try {
    const testData = {
      ...req.body,
      createdBy: req.user._id
    };

    const test = await Test.create(testData);
    res.status(201).json(test);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Assign a test to a job (Recruiter only)
 */
export const assignTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const { jobId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId) || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid test ID or job ID" });
    }

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Validate the job belongs to the recruiter
    const job = await Job.findOne({ _id: jobId, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or you don't have permission" });

    // Assign the job to the test: Add to the jobs array without duplicates
    if (!test.jobs) test.jobs = [];
    if (!test.jobs.includes(jobId)) {
      test.jobs.push(jobId);
      await test.save();
    }

    res.json({ message: "Test assigned to job successfully", test });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update/Edit a test (Recruiter only)
 */
export const updateTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "Invalid test ID" });
    }

    const test = await Test.findOneAndUpdate(
      { _id: testId, createdBy: req.user._id }, // Ensure recruiter owns it
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({ message: "Test not found or unauthorized to edit" });
    }

    res.json({ message: "Test updated successfully", test });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a test (Recruiter only)
 */
export const deleteTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "Invalid test ID" });
    }

    const test = await Test.findOneAndDelete({
      _id: testId,
      createdBy: req.user._id
    });

    if (!test) {
      return res.status(404).json({ message: "Test not found or unauthorized to delete" });
    }

    // Cascade delete: cleanup TestAttempts related to this test
    await TestAttempt.deleteMany({ test: testId });

    res.json({ message: "Test deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all attempts/results for a specific test (Recruiter only)
 */
export const getTestResultsByTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "Invalid test ID" });
    }

    // Verify test exists and is owned by recruiter
    const test = await Test.findOne({ _id: testId, createdBy: req.user._id });
    if (!test) {
      return res.status(404).json({ message: "Test not found or unauthorized" });
    }

    // Find all attempts
    const attempts = await TestAttempt.find({ test: testId, status: "completed" })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    // Format for frontend
    const results = attempts.map(attempt => ({
      studentName: (attempt.student as any)?.name || 'Unknown',
      score: attempt.percentage,
      attemptedAt: attempt.submittedAt
    }));

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
