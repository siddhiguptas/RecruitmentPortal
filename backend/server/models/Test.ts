import mongoose from "mongoose";

const TestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    company: { type: String, default: "" },
    type: { type: String, enum: ["MCQ", "Coding"], default: "MCQ" },
    duration: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    difficulty: { type: String, default: "Easy" },
    passingScore: { type: Number, default: 0 },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    startTime: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questions: [
      {
        questionText: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
        marks: Number,
      },
    ],
    codingProblems: [
      {
        title: String,
        description: String,
        inputFormat: String,
        outputFormat: String,
        constraints: String,
        examples: [
          {
            input: String,
            output: String,
            explanation: String,
          },
        ],
        marks: Number,
      },
    ],
  },
  { timestamps: true }
);

export const Test = mongoose.model("Test", TestSchema);
