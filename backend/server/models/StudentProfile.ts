import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skills: [{ type: String }],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        grade: String,
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    resumeUrl: { type: String },
    parsedResumeData: { type: Object }, // Data from ML service
    placementProbability: { type: Number }, // From ML service
    eligibilityStatus: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
