import { Response } from "express";
import mongoose from "mongoose";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { Interview } from "../models/Interview";
import { User } from "../models/User";
import { StudentProfile } from "../models/StudentProfile";
import { RecruiterProfile } from "../models/RecruiterProfile";
import { NotificationService } from "../services/notificationService";
import { mlService } from "../services/mlService";
import { AuthRequest } from "../types";

const toPublicResumeUrl = (req: AuthRequest, resumeValue?: string | null): string | undefined => {
  if (!resumeValue) return undefined;
  if (/^https?:\/\//i.test(resumeValue)) return resumeValue;

  const host = req.get("host");
  if (!host) return resumeValue;

  const filename = resumeValue.replace(/\\/g, "/").split("/").pop();
  if (!filename) return resumeValue;
  return `${req.protocol}://${host}/uploads/resumes/${encodeURIComponent(filename)}`;
};

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

    const normalizedApplications = applications.map((application) => {
      const obj = application.toObject();
      return {
        ...obj,
        resumeUrl: toPublicResumeUrl(req, obj.resumeUrl),
      };
    });

    res.json(normalizedApplications);
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
      .populate("student", "name email")
      .populate("job", "title")
      .sort("-createdAt");

    const studentIds = applications
      .map((app) => (app.student as any)?._id?.toString?.())
      .filter(Boolean);

    const profiles = await StudentProfile.find({ user: { $in: studentIds } }).select(
      "user college branch skills resumeUrl"
    );
    const profileByUser = new Map(
      profiles.map((profile) => [profile.user.toString(), profile])
    );

    const formatted = applications.map((app) => {
      const student = app.student as any;
      const job = app.job as any;
      const profile = profileByUser.get(student?._id?.toString?.());
      return {
        _id: app._id,
        studentName: student?.name || "Unknown",
        email: student?.email || "",
        college: profile?.college,
        branch: profile?.branch,
        skills: profile?.skills || [],
        resumeUrl: toPublicResumeUrl(req, profile?.resumeUrl || app.resumeUrl),
        jobTitle: job?.title || "",
        appliedDate: app.createdAt,
        status: app.status,
        jobId: job?._id || app.job,
      };
    });

    res.json(formatted);
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
    }).populate("user", "name");

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

    // Call ML service to rank candidates
    const rankedCandidates = await mlService.rankCandidates(job, candidatesPayload);

    // Update match scores in applications
    for (const ranked of rankedCandidates) {
      if (!ranked.studentId) continue;
      await Application.findOneAndUpdate(
        { job: jobId, student: ranked.studentId },
        { matchScore: Math.round((ranked.match_score || 0) * 100) }
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

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = await RecruiterProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = await RecruiterProfile.create({
        user: req.user._id,
        companyName: "Company Name Not Set",
      });
    }

    const activeJobsCount = await Job.countDocuments({ recruiter: req.user._id, isActive: true });
    const totalJobsCount = await Job.countDocuments({ recruiter: req.user._id });
    const jobIds = (await Job.find({ recruiter: req.user._id }).select('_id')).map(j => j._id);
    const totalApplicationsCount = await Application.countDocuments({ job: { $in: jobIds } });
    const shortlistedCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'shortlisted' });
    
    // Quick jobs & applications lookup for the dashboard summary pieces
    const recentJobs = await Job.find({ recruiter: req.user._id }).sort("-createdAt").limit(5);
    const recentApps = await Application.find({ job: { $in: jobIds } }).populate("job", "title").populate("student", "name email").sort("-createdAt").limit(5);

    const formattedJobs = await Promise.all(recentJobs.map(async (job) => {
      const applicants = await Application.countDocuments({ job: job._id });
      return { id: job._id, title: job.title, location: job.location, applicants, isActive: job.isActive };
    }));

    const formattedApps = recentApps.map((app) => {
      return {
        id: app._id,
        studentName: (app.student as any)?.name || "Unknown",
        skills: [],
        jobTitle: (app.job as any)?.title || "",
        appliedDate: app.createdAt
      };
    });

    res.json({
      recruiter: {
        name: user?.name,
        email: user?.email,
        phone: profile.phone,
        profilePhotoUrl: profile.profilePhotoUrl
      },
      company: {
        name: profile.companyName,
        logoUrl: profile.logoUrl,
        industry: profile.industry,
        website: profile.companyWebsite,
        size: profile.size,
        location: profile.location,
        foundedYear: profile.foundedYear,
        description: profile.companyDescription
      },
      stats: {
        totalJobs: totalJobsCount,
        activeJobs: activeJobsCount,
        totalApplications: totalApplicationsCount,
        shortlistedStudents: shortlistedCount
      },
      recentJobs: formattedJobs,
      recentApplications: formattedApps,
      verificationStatus: "verified"
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { recruiter, company } = req.body;
    
    if (recruiter && recruiter.name) {
      await User.findByIdAndUpdate(req.user._id, { name: recruiter.name });
    }

    const updateData: any = {};
    if (recruiter?.phone) updateData.phone = recruiter.phone;
    if (company) {
      if (company.name) updateData.companyName = company.name;
      if (company.website) updateData.companyWebsite = company.website;
      if (company.description) updateData.companyDescription = company.description;
      if (company.industry) updateData.industry = company.industry;
      if (company.location) updateData.location = company.location;
      if (company.size) updateData.size = company.size;
    }

    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePhoto = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const profilePhotoUrl = `/uploads/${req.file.filename}`;
    const profile = await RecruiterProfile.findOneAndUpdate(
       { user: req.user._id },
       { profilePhotoUrl },
       { new: true, upsert: true }
    );
    res.json({ profilePhotoUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadLogo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const logoUrl = `/uploads/${req.file.filename}`;
    const profile = await RecruiterProfile.findOneAndUpdate(
       { user: req.user._id },
       { logoUrl },
       { new: true, upsert: true }
    );
    res.json({ logoUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
