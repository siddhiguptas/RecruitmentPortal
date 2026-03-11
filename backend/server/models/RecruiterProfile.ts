import mongoose from "mongoose";

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    companyWebsite: { type: String },
    companyDescription: { type: String },
    industry: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

export const RecruiterProfile = mongoose.model("RecruiterProfile", recruiterProfileSchema);
