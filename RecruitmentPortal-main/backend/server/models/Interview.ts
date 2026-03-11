import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // in minutes
    meetingLink: { type: String },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Interview = mongoose.model("Interview", interviewSchema);
