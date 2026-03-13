import mongoose from "mongoose";

const mcqAnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number },
    timeSpent: { type: Number, default: 0 },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const codingAnswerSchema = new mongoose.Schema(
  {
    problemIndex: { type: Number, required: true },
    code: { type: String, default: "" },
    language: { type: String, default: "javascript" },
    timeSpent: { type: Number, default: 0 },
    testResults: { type: Array, default: [] },
    score: { type: Number, default: 0 },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    timeTaken: Number,
    mcqAnswers: { type: [mcqAnswerSchema], default: [] },
    codingAnswers: { type: [codingAnswerSchema], default: [] },
    mcqScore: Number,
    codingScore: Number,
    totalScore: Number,
    percentage: Number,
    passed: Boolean,
  },
  { timestamps: true }
);

export const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);
