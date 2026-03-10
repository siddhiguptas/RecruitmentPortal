import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { StudentProfile } from "../models/StudentProfile";
import { mlService } from "../services/mlService";

export const getPlacementAnalytics = async (req: Request, res: Response) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalRecruiters = await User.countDocuments({ role: "recruiter" });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    const placedStudents = await Application.countDocuments({ status: "offered" });
    const placementRate = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;

    res.json({
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications,
      placedStudents,
      placementRate: placementRate.toFixed(2),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyStudentEligibility = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { isEligible } = req.body;

  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user: studentId },
      { eligibilityStatus: isEligible },
      { new: true }
    );
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const predictStudentPlacement = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const studentData = req.body;

  try {
    const prediction = await mlService.predictPlacement(studentData);

    // Optionally update student profile with prediction
    await StudentProfile.findOneAndUpdate(
      { user: studentId },
      { placementProbability: prediction.placement_probability }
    );

    res.json(prediction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().populate("recruiter", "name companyName");
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await StudentProfile.find().populate("user", "name email");
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRecruiters = async (req: Request, res: Response) => {
  try {
    const recruiters = await User.find({ role: "recruiter" }).select("-password");
    res.json(recruiters);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
