import { Response } from "express";
import mongoose from "mongoose";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { Interview } from "../models/Interview";
import { User } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { NotificationService } from "../services/notificationService";
import { mlService } from "../services/mlService";
import { AuthRequest } from "../types";

export const postJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.create({
      ...req.body,
      recruiter: req.user._id,
    });
    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplicants = async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  try {
    const applications = await Application.find({ job: jobId })
      .populate("student", "name email college branch skills")
      .sort("-matchScore");
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// fetch all applications across recruiter’s jobs (allows client-side filtering)
export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    // find jobs belonging to this recruiter
    const jobs = await Job.find({ recruiter: req.user._id }).select("_id title");
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("student", "name email college branch skills")
      .populate("job", "title")
      .sort("-createdAt");

    // attach job title at top level for convenience
    const appsWithTitle = applications.map((app) => {
      const doc = app.toObject();
      (doc as any).jobTitle = (app.job as any)?.title || "";
      return doc;
    });

    res.json(appsWithTitle);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const rankCandidates = async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applications = await Application.find({ job: jobId }).populate("student");
    const candidates = await StudentProfile.find({
      user: { $in: applications.map((app) => (app.student as any)._id) },
    });

    // Call ML service to rank candidates
    const rankedCandidates = await mlService.rankCandidates(job.description, candidates);

    // Update match scores in applications
    for (const ranked of rankedCandidates) {
      await Application.findOneAndUpdate(
        { job: jobId, student: ranked.studentId },
        { matchScore: ranked.score }
      );
    }

    res.json(rankedCandidates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  const { applicationId } = req.params;
  const { status, feedback } = req.body;

  try {
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status, feedback },
      { new: true }
    ).populate("student", "name email").populate("job");

    // Emit real-time notification via Socket.io
    const io = req.app.get("io");
    if (application) {
      io.to(application.student.toString()).emit("application_update", {
        applicationId,
        status,
        feedback,
      });

      // Send email notification
      try {
        const student = application.student as any;
        const job = application.job as any;
        const companyName = job.company;

        let subject = "";
        let message = "";

        if (status === "shortlisted") {
          subject = `Great News! You've been shortlisted for ${job.title}`;
          message = `Hi ${student.name},\n\nCongratulations! You have been shortlisted for the position of ${job.title} at ${companyName}.\n\nFeedback: ${feedback || "No feedback provided."}\n\nThe recruiter will contact you soon for the next steps.\n\nBest regards,\nRecruitment Portal Team`;
        } else if (status === "offered") {
          subject = `Job Offer: ${job.title} at ${companyName}`;
          message = `Hi ${student.name},\n\nWe are pleased to offer you the position of ${job.title} at ${companyName}!\n\nFeedback: ${feedback || "Welcome to the team!"}\n\nPlease review the details and get in touch with the recruiter.\n\nCongratulations!\nRecruitment Portal Team`;
        } else if (status === "rejected") {
          subject = `Update on your application for ${job.title}`;
          message = `Hi ${student.name},\n\nThank you for your interest in the ${job.title} position at ${companyName}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nFeedback: ${feedback || "Thank you for applying."}\n\nWe wish you the best in your job search.\n\nBest regards,\nRecruitment Portal Team`;
        }

        if (subject) {
          await NotificationService.sendInstantUpdate(student.email, subject, message);
        }
      } catch (notifyError) {
        console.error("Failed to send status update notification:", notifyError);
      }
    }

    res.json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const scheduleInterview = async (req: AuthRequest, res: Response) => {
  const { applicationId, scheduledAt, duration, meetingLink, notes } = req.body;

  try {
    const application = await Application.findById(applicationId).populate("student").populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });

    const interview = await Interview.create({
      application: applicationId,
      student: (application.student as any)._id,
      recruiter: req.user._id,
      scheduledAt,
      duration,
      meetingLink,
      notes,
    });

    // Update application status to 'interviewing'
    application.status = "interviewing";
    await application.save();

    // Send notifications
    try {
      const student = application.student as any;
      const job = application.job as any;
      const companyName = job.company;
      const interviewDate = new Date(scheduledAt).toLocaleString();

      // 1. Immediate confirmation email
      await NotificationService.sendInstantUpdate(
        student.email,
        `Interview Scheduled: ${job.title} at ${companyName}`,
        `Hi ${student.name},\n\nAn interview has been scheduled for the position of ${job.title} at ${companyName}.\n\nDate & Time: ${interviewDate}\nDuration: ${duration} minutes\nMeeting Link: ${meetingLink || "To be provided"}\nNotes: ${notes || "None"}\n\nGood luck!\nRecruitment Portal Team`
      );

      // 2. Reminder email 24 hours before interview
      const reminderTime = new Date(new Date(scheduledAt).getTime() - 24 * 60 * 60 * 1000);
      
      // Only schedule if the reminder time is in the future
      if (reminderTime > new Date()) {
        const cronTime = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`;
        
        NotificationService.scheduleReminder(
          cronTime,
          student.email,
          `Reminder: Your interview for ${job.title} at ${companyName} is tomorrow at ${interviewDate}.\n\nMeeting Link: ${meetingLink || "Check your portal"}`
        );
      }
    } catch (notifyError) {
      console.error("Failed to send interview notifications:", notifyError);
    }

    res.status(201).json(interview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
