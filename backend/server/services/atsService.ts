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

type Pipeline = Record<ApplicationStatus, Application[]>;

let applications: Application[] = [];

export const applyJob = async (data: ApplyJobInput): Promise<Application> => {
  const { studentName, jobRole, resumeText, jobDescription } = data;

  const response = await axios.post<{ score: number }>(
    "http://127.0.0.1:8000/match-job",
    {
      resume_text: resumeText,
      job_description: jobDescription,
    },
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
