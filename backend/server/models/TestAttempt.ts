import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // MCQ Answers
    mcqAnswers: [{
      questionIndex: { type: Number, required: true },
      selectedAnswer: { type: Number },
      timeSpent: { type: Number }, // in seconds
      isCorrect: { type: Boolean }
    }],

    // Coding Answers
    codingAnswers: [{
      problemIndex: { type: Number, required: true },
      code: { type: String },
      language: { type: String, default: "javascript" },
      timeSpent: { type: Number }, // in seconds
      testResults: [{
        testCaseIndex: { type: Number },
        passed: { type: Boolean },
        actualOutput: { type: String },
        executionTime: { type: Number }
      }],
      score: { type: Number, default: 0 }
    }],

    // Proctoring data
    proctoringEvents: [{
      type: { type: String, enum: ["face_not_visible", "multiple_faces", "looking_away", "tab_switch", "suspicious_audio"] },
      timestamp: { type: Date, default: Date.now },
      description: { type: String }
    }],

    // Results
    totalScore: { type: Number },
    mcqScore: { type: Number },
    codingScore: { type: Number },
    percentage: { type: Number },
    passed: { type: Boolean },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    timeTaken: { type: Number }, // in minutes

    // Status
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "flagged"],
      default: "not_started"
    },

    // Proctoring flags
    flagged: { type: Boolean, default: false },
    flagReason: { type: String },
  },
  { timestamps: true }
);

export const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);