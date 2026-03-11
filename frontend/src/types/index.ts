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
  _id: string;
  user: string | User;
  resumeUrl?: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
  placementProbability?: number;
  eligibilityStatus?: "pending" | "eligible" | "ineligible";
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
  requirements: string[];
  postedBy: string | User;
  createdAt: string;
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
