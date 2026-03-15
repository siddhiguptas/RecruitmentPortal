import { Response } from "express";
import mongoose from "mongoose";
import { StudentProfile } from "../models/StudentProfile";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { NotificationService } from "../services/notificationService";
import { mlService } from "../services/mlService";
import { AuthRequest } from "../types";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    res.json(profile || { user: req.user._id, skills: [] });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { ...req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadResume = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // 1. Call ML Service to parse resume
    const parsedData = await mlService.parseResume(req.file.path);

    // 2. Update student profile with parsed data
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        resumeUrl: req.file.path,
        parsedResumeData: parsedData,
        skills: parsedData.skills || [],
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Resume uploaded and parsed", profile });
  } catch (error: any) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedJobs = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile || !profile.parsedResumeData) {
      return res.json([]); // Return empty array instead of error
    }

    const jobs = await Job.find({ isActive: true });
    const recommendations = await mlService.recommendJobs(profile.parsedResumeData, jobs);

    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const applyToJob = async (req: AuthRequest, res: Response) => {
  const { jobId } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: "Profile not found" });

    // Calculate match score using ML service
    const matchResult = await mlService.matchJob(profile.parsedResumeData, job.description);

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      matchScore: matchResult.score,
      resumeUrl: profile.resumeUrl,
    });

    // Send notification
    try {
      const studentName = (req.user as any).name;
      const companyName = job.company;
      const jobTitle = job.title;

      await NotificationService.sendInstantUpdate(
        (req.user as any).email,
        `Application Received: ${jobTitle} at ${companyName}`,
        `Hi ${studentName},\n\nYour application for the position of ${jobTitle} at ${companyName} has been successfully submitted.\n\nStatus: Applied\n\nBest of luck!\nRecruitment Portal Team`
      );
    } catch (notifyError) {
      console.error("Failed to send application notification:", notifyError);
      // Don't fail the request if notification fails
    }

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find({ student: req.user._id }).populate("job");
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
