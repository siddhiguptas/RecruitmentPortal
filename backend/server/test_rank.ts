import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

import { User } from "./models/User";
import { Job } from "./models/Job";
import { Application } from "./models/Application";
import { StudentProfile } from "./models/StudentProfile";
import { RecruiterProfile } from "./models/RecruiterProfile";
import { mlService } from "./services/mlService";

const testRankCandidates = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://siddhiguptas107:RecruitmentPortal11@cluster0.evlwocj.mongodb.net/recruitment");
  console.log("Connected to MongoDB");

  // Force register models by accessing them
  [User, Job, Application, StudentProfile, RecruiterProfile];

  // Get any job that has applications
  const app = await Application.findOne({});
  if (!app) {
    console.log("No applications found.");
    process.exit(0);
  }

  const jobId = app.job;
  const job = await Job.findById(jobId);
  if (!job) {
     console.log("Job missing");
     process.exit(1);
  }
  
  const applications = await Application.find({ job: jobId }).populate("student");
  const candidates = await StudentProfile.find({
    user: { $in: applications.map((a) => (a.student as any)._id) },
  }).populate("user", "name");

  console.log(`Found Job: ${job.title}, Candidates: ${candidates.length}`);

  const candidatesPayload = candidates.map((candidate) => {
    const parsed = (candidate as any).parsedResumeData || {};
    const userId = (candidate.user as any)?._id?.toString?.() || candidate.user.toString();
    return {
      studentId: userId,
      name: (candidate as any).fullName || (candidate as any).user?.name || "Unknown",
      skills: candidate.skills?.length ? candidate.skills : parsed.skills || [],
      experience_years: parsed.experience_years || 0,
      cgpa: parsed.cgpa || (candidate as any).cgpa,
    };
  });

  console.log("Sending payload to ML engine:", JSON.stringify(candidatesPayload, null, 2));

  try {
    const rankedCandidates = await mlService.rankCandidates(job, candidatesPayload);
    console.log("Returned ranked candidates from ML engine:");
    console.log(JSON.stringify(rankedCandidates, null, 2));

    for (const ranked of rankedCandidates) {
      if (!ranked.studentId) {
        console.log("FAIL: studentId missing from ranking result", ranked);
        continue;
      }
      const updatedApp = await Application.findOneAndUpdate(
        { job: jobId, student: ranked.studentId },
        { matchScore: Math.round((ranked.match_score || 0) * 100) },
        { new: true }
      );
      console.log(`Updated App (${updatedApp?._id}) matchScore to ${updatedApp?.matchScore}%`);
    }
  } catch (err: any) {
    console.error("Error during ML routing", err.message);
  }

  process.exit(0);
};

testRankCandidates();
