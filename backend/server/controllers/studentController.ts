import { Response } from "express";
import mongoose from "mongoose";
import { StudentProfile } from "../models/StudentProfile";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
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

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.json({ user: req.user._id, skills: [] });
    }

    const profileObj = profile.toObject();
    const resumeUrl = toPublicResumeUrl(req, profileObj.resumeUrl);
    res.json({
      ...profileObj,
      resumeUrl,
      resumePath: resumeUrl,
    });
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
    const resumeUrl = toPublicResumeUrl(req, req.file.filename);
    let parsedData: any = null;

    // Parse resume if ML service is reachable; keep upload successful even if parsing fails.
    try {
      parsedData = await mlService.parseResume(req.file.path);
    } catch (mlError) {
      console.error("Resume parsing failed, storing file without parsed data:", mlError);
    }

    const updatePayload: any = {
      resumeUrl,
    };

    if (parsedData) {
      updatePayload.parsedResumeData = parsedData;
      updatePayload.skills = parsedData.skills || [];
      updatePayload.fullName = parsedData.name || undefined;
      updatePayload.phone = parsedData.phone || undefined;
      updatePayload.cgpa = parsedData.cgpa || undefined;

      if (Array.isArray(parsedData.education)) {
        updatePayload.education = parsedData.education.map((edu: any) => ({
          institution: edu.institution || undefined,
          degree: edu.degree || undefined,
          fieldOfStudy: edu.fieldOfStudy || undefined,
          startYear: edu.start_year ? Number(edu.start_year) : undefined,
          endYear: edu.end_year ? Number(edu.end_year) : undefined,
          grade: edu.cgpa !== undefined ? String(edu.cgpa) : undefined,
        }));
        const firstEdu = parsedData.education[0];
        if (firstEdu?.institution) {
          updatePayload.college = firstEdu.institution;
        }
        if (firstEdu?.end_year) {
          updatePayload.graduationYear = Number(firstEdu.end_year);
        }
      }

      if (Array.isArray(parsedData.experience)) {
        updatePayload.experience = parsedData.experience.map((exp: any) => ({
          description: exp,
        }));
      }
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      updatePayload,
      { new: true, upsert: true }
    );

    const profileObj = profile?.toObject?.() || profile;
    res.json({
      message: parsedData ? "Resume uploaded and parsed" : "Resume uploaded. Parsing will be retried later.",
      profile: {
        ...profileObj,
        resumeUrl,
        resumePath: resumeUrl,
      },
    });
  } catch (error: any) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedJobs = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.json([]);
    }

    // Build student profile data for ML service
    // Use parsedResumeData if available, otherwise use manually entered profile data
    let studentProfileData: any = {
      skills: [],
      experience_years: 0,
      cgpa: undefined as number | undefined
    };

    // Get skills from parsed resume or manual entry
    const profileSkills = profile.skills || [];
    const parsedSkills = profile.parsedResumeData?.skills || [];
    studentProfileData.skills = parsedSkills.length > 0 ? parsedSkills : profileSkills;

    // Get experience years from parsed data or calculate from experience array
    if (profile.parsedResumeData?.experience_years) {
      studentProfileData.experience_years = profile.parsedResumeData.experience_years;
    } else if (profile.experience && profile.experience.length > 0) {
      // Calculate experience from experience array
      let totalMonths = 0;
      for (const exp of profile.experience) {
        if (exp.startDate && exp.endDate) {
          const start = new Date(exp.startDate).getTime();
          const end = new Date(exp.endDate).getTime();
          totalMonths += (end - start) / (1000 * 60 * 60 * 24 * 30);
        }
      }
      studentProfileData.experience_years = Math.max(0, totalMonths / 12);
    }

    // Get CGPA from parsed data or manual entry
    const profileCgpa = profile.cgpa;
    const parsedCgpa = profile.parsedResumeData?.cgpa;
    studentProfileData.cgpa = parsedCgpa || profileCgpa;

    // If no skills at all, return empty array
    if (studentProfileData.skills.length === 0) {
      return res.json([]);
    }

    const jobs = await Job.find({ isActive: true });
    if (jobs.length === 0) {
      return res.json([]);
    }

    const recommendations = await mlService.recommendJobs(studentProfileData, jobs);
    const jobsById = new Map(jobs.map((job) => [job._id.toString(), job]));

    const enriched = recommendations
      .map((rec: any) => {
        const jobId = rec.jobId || rec.job_id;
        let job = jobId ? jobsById.get(String(jobId)) : undefined;
        if (!job && rec.job_title) {
          job = jobs.find((item) => item.title === rec.job_title);
        }
        if (!job) {
          return null;
        }
        return {
          ...job.toObject(),
          matchScore: Math.round((rec.match_score || 0) * 100),
          recommendation: rec.recommendation,
        };
      })
      .filter(Boolean);

    res.json(enriched);
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

    // Build profile data for matching - use parsed or manual data
    let profileData: any = {
      skills: profile.skills || [],
      experience_years: 0,
      cgpa: profile.cgpa
    };

    // Get skills from parsed resume or manual entry
    if (profile.parsedResumeData?.skills?.length > 0) {
      profileData.skills = profile.parsedResumeData.skills;
    }

    // Get experience years
    if (profile.parsedResumeData?.experience_years) {
      profileData.experience_years = profile.parsedResumeData.experience_years;
    } else if (profile.experience && profile.experience.length > 0) {
      let totalMonths = 0;
      for (const exp of profile.experience) {
        if (exp.startDate && exp.endDate) {
          const start = new Date(exp.startDate).getTime();
          const end = new Date(exp.endDate).getTime();
          totalMonths += (end - start) / (1000 * 60 * 60 * 24 * 30);
        }
      }
      profileData.experience_years = Math.max(0, totalMonths / 12);
    }

    // Get CGPA
    if (profile.parsedResumeData?.cgpa) {
      profileData.cgpa = profile.parsedResumeData.cgpa;
    }

    // Require at least skills to apply
    if (!profileData.skills || profileData.skills.length === 0) {
      return res.status(400).json({ message: "Please add skills to your profile or upload a resume before applying to jobs." });
    }

    // Calculate match score using ML service; do not block application if ML is down
    let matchScore = 0;
    try {
      const matchResult = await mlService.matchJob(profileData, job.description);
      matchScore = Math.round((matchResult.match_score || 0) * 100);
    } catch (mlError) {
      console.error("Match scoring failed, proceeding without score:", mlError);
    }

    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      matchScore: matchScore || undefined,
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
