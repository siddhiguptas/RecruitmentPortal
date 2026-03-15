import axios from "axios";

type ApplicationStatus = "Applied" | "Shortlisted" | "Interview" | "Offered" | "Rejected";

interface ApplyJobInput {
  studentName: string;
  jobRole: string;
  resumeText: string;
  jobDescription: string;
}

interface Application {
  id: number;
  studentName: string;
  jobRole: string;
  score: number;
  status: ApplicationStatus;
}

interface ResumeData {
  skills: string[];
  experience_years?: number;
  cgpa?: number;
}

interface MatchJobResponse {
  score: number;
}

type Pipeline = Record<ApplicationStatus, Application[]>;

let applications: Application[] = [];

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export const applyJob = async (data: ApplyJobInput): Promise<Application> => {
  const { studentName, jobRole, resumeText, jobDescription } = data;

  // STEP 1: parse resume
  const parsed = await axios.post<ResumeData>(
    `${ML_SERVICE_URL}/parse-resume`,
    { text: resumeText }
  );

  const resumeData = parsed.data;

  // STEP 2: job matching
  const response = await axios.post<MatchJobResponse>(
    `${ML_SERVICE_URL}/match-job`,
    {
      skills: resumeData.skills,
      job_description: jobDescription,
      experience_years: resumeData.experience_years || 0,
      cgpa: resumeData.cgpa || 0
    }
  );

  const application: Application = {
    id: Date.now(),
    studentName,
    jobRole,
    score: response.data.score,
    status: "Applied",
  };

  applications.push(application);
  return application;
};
export const getPipeline = async (): Promise<Pipeline> => {
  const pipeline: Pipeline = {
    Applied: [],
    Shortlisted: [],
    Interview: [],
    Offered: [],
    Rejected: [],
  };

  applications.forEach((app) => {
    pipeline[app.status].push(app);
  });

  return pipeline;
};

export const updateStatus = async (
  id: string | number,
  status?: string,
): Promise<Application> => {
  if (!status) {
    throw new Error("Status is required");
  }

  const validStatuses: ApplicationStatus[] = [
    "Applied",
    "Shortlisted",
    "Interview",
    "Offered",
    "Rejected",
  ];

  if (!validStatuses.includes(status as ApplicationStatus)) {
    throw new Error("Invalid status");
  }

  const app = applications.find((item) => item.id === Number(id));
  if (!app) {
    throw new Error("Application not found");
  }

  app.status = status as ApplicationStatus;
  return app;
};
