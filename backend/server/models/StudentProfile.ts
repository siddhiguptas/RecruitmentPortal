import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String },
    phone: { type: String },
    college: { type: String },
    branch: { type: String },
    graduationYear: { type: Number },
    skills: { type: [String], default: [] },
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
    cgpa: { type: Number },
    placementProbability: { type: Number }, // From ML service
    eligibilityStatus: {
      type: String,
      enum: ["pending", "eligible", "ineligible"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
