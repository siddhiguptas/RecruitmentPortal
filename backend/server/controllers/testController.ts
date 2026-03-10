import { Response } from "express";
import { Test } from "../models/Test";
import { TestAttempt } from "../models/TestAttempt";
import { AuthRequest } from "../types";

export const getAvailableTests = async (req: AuthRequest, res: Response) => {
  try {
    const tests = await Test.find({
      isActive: true,
      $or: [
        { startTime: { $exists: false } },
        { startTime: { $lte: new Date() } }
      ]
    }).populate('createdBy', 'name').select('title company type duration totalQuestions difficulty deadline passingScore createdAt');

    res.json(tests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

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
      return res.status(400).json({ message: "Test already completed" });
    }

    // Return test data based on type
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
        options: q.options
      }));
    } else if (test.type === 'Coding') {
      (testData as any).codingProblems = test.codingProblems?.map(p => ({
        title: p.title,
        description: p.description,
        inputFormat: p.inputFormat,
        outputFormat: p.outputFormat,
        constraints: p.constraints,
        examples: p.examples
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

export const startTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;

    // Check if test exists and is active
    const test = await Test.findById(testId);
    if (!test || !test.isActive) {
      return res.status(404).json({ message: "Test not found or inactive" });
    }

    // Check for existing attempt
    let attempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id
    });

    if (!attempt) {
      attempt = await TestAttempt.create({
        test: testId,
        student: req.user._id,
        status: 'in_progress',
        startedAt: new Date()
      });
    } else if (attempt.status === 'completed') {
      return res.status(400).json({ message: "Test already completed" });
    }

    res.json({
      attemptId: attempt._id,
      test,
      timeRemaining: test.duration * 60 // in seconds
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const { answers, proctoringEvents } = req.body;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const attempt = await TestAttempt.findOne({
      test: testId,
      student: req.user._id,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ message: "Test attempt not found" });
    }

    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer: any, index: number) => {
      if (answer.selectedAnswer === test.questions[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const score = correctAnswers;
    const percentage = (score / test.totalQuestions) * 100;
    const passed = percentage >= test.passingScore;

    // Check for proctoring violations
    const hasViolations = proctoringEvents && proctoringEvents.length > 0;
    const flagged = hasViolations;

    // Update attempt
    attempt.answers = answers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.submittedAt = new Date();
    attempt.timeTaken = Math.floor((new Date().getTime() - attempt.startedAt!.getTime()) / (1000 * 60));
    attempt.status = 'completed';
    attempt.proctoringEvents = proctoringEvents || [];
    attempt.flagged = flagged;
    if (flagged) {
      attempt.flagReason = "Proctoring violations detected";
    }

    await attempt.save();

    res.json({
      score,
      percentage,
      passed,
      flagged,
      totalQuestions: test.totalQuestions
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTestResults = async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await TestAttempt.find({
      student: req.user._id
    }).populate('test', 'title subject passingScore');

    res.json(attempts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};