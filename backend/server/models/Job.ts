import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    location: { type: String, required: true },
    salary: { type: String },
    jobType: {
      type: String,
      enum: ["full-time", "internship", "part-time"],
      default: "full-time",
    },
    skillsRequired: [{ type: String }],
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
