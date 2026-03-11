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

    // Eligibility Criteria
    minimumCgpa: { type: Number, min: 0, max: 10 },
    minimumTenthPercentage: { type: Number, min: 0, max: 100 },
    minimumTwelfthPercentage: { type: Number, min: 0, max: 100 },
    requiredBranches: [{ type: String }], // e.g., ["Computer Science", "Information Technology"]
    maximumBacklogs: { type: Number, default: 0 },
    requiredCertifications: [{ type: String }],
    experienceRequired: { type: String }, // "0-2 years", "fresher", etc.

    // Additional Job Details
    department: { type: String },
    workMode: { type: String, enum: ["remote", "hybrid", "onsite"], default: "onsite" },
    applicationFee: { type: Number, default: 0 },
    selectionProcess: [{ type: String }], // ["Written Test", "Technical Interview", "HR Interview"]
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
