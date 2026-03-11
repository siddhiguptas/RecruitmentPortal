export enum UserRole {
  STUDENT = "student",
  RECRUITER = "recruiter",
  ADMIN = "admin",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "recruiter" | "admin";
  token?: string;
}

export interface StudentProfile {
  _id?: string;
  user: string | User;
  fullName?: string;
  phone?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
  skills: string[];
  resumePath?: string;
  resumeUrl?: string;
  experience?: string;
  education?: string;
  summary?: string;
  placementProbability?: number;
  eligibilityStatus?: "pending" | "eligible" | "ineligible";
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  jobType: string;
  requirements: string[];
  skillsRequired?: string[];
  experienceRequired?: string;
  postedBy: string | User;
  createdAt: string;
  deadline?: string;
  isActive?: boolean;
  minimumCgpa?: number;
  minimumTenthPercentage?: number;
  minimumTwelfthPercentage?: number;
  requiredBranches?: string[];
  maximumBacklogs?: number;
  requiredCertifications?: string[];
  department?: string;
  workMode?: string;
  applicationFee?: number;
  selectionProcess?: string[];
}

export interface Analytics {
  totalStudents: number;
  totalRecruiters: number;
  totalJobs: number;
  totalApplications: number;
  placedStudents: number;
  placementsByMonth: { month: string; count: number }[];
  topSkills: { skill: string; count: number }[];
}

export interface Application {
  _id: string;
  job: string | Job;
  student: string | User;
  status: "applied" | "shortlisted" | "interviewing" | "offered" | "rejected";
  resumeUrl: string;
  matchScore: number;
  createdAt: string;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  duration: number;
  questions: Question[];
}

export interface Question {
  _id: string;
  text: string;
  options: string[];
  correctOption: number;
}
