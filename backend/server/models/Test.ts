import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    type: { type: String, enum: ["MCQ", "Coding"], required: true },
    description: { type: String },
    duration: { type: Number, required: true }, // in minutes
    totalQuestions: { type: Number, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    deadline: { type: Date },
    passingScore: { type: Number, required: true }, // percentage

    // Questions - for MCQ tests
    questions: [{
      questionText: { type: String, required: true },
      options: [{ type: String }], // 4 options for MCQ
      correctAnswer: { type: Number, required: true }, // index of correct option
      marks: { type: Number, default: 1 },
      explanation: { type: String }
    }],

    // Coding problems - for coding tests
    codingProblems: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      inputFormat: { type: String },
      outputFormat: { type: String },
      constraints: { type: String },
      examples: [{
        input: { type: String },
        output: { type: String },
        explanation: { type: String }
      }],
      testCases: [{
        input: { type: String },
        expectedOutput: { type: String },
        isHidden: { type: Boolean, default: false }
      }],
      difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
      marks: { type: Number, default: 10 }
    }],

    // Proctoring settings
    proctoringEnabled: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: true },
    microphoneRequired: { type: Boolean, default: false },
    screenSharingRequired: { type: Boolean, default: false },

    // Scheduling
    startTime: { type: Date },
    endTime: { type: Date },
    isActive: { type: Boolean, default: true },

    // Created by
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Test = mongoose.model("Test", testSchema);