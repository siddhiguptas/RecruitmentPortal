import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interviewing", "offered", "rejected"],
      default: "applied",
    },
    matchScore: { type: Number }, // From ML service
    resumeUrl: { type: String },
    feedback: { type: String },
  },
  { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);
