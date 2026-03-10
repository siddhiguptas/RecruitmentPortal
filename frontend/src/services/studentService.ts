import api from "./api";
import { Job, Application, StudentProfile } from "../types";

export const studentService = {
  uploadResume: async (formData: FormData): Promise<{ message: string; profile: StudentProfile }> => {
    const response = await api.post("/students/upload-resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updateProfile: async (profileData: Partial<StudentProfile>): Promise<StudentProfile> => {
    const response = await api.put("/students/profile", profileData);
    return response.data;
  },

  getProfile: async (): Promise<StudentProfile> => {
    const response = await api.get("/students/profile");
    return response.data;
  },

  getRecommendedJobs: async (): Promise<Job[]> => {
    const response = await api.get("/students/recommended-jobs");
    return response.data;
  },

  applyToJob: async (jobId: string): Promise<Application> => {
    const response = await api.post("/students/apply", { jobId });
    return response.data;
  },

  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get("/students/applications");
    return response.data;
  },

  getAvailableTests: async (): Promise<any[]> => {
    const response = await api.get("/students/tests");
    return response.data;
  },

  getTestDetails: async (testId: string): Promise<any> => {
    const response = await api.get(`/students/tests/${testId}`);
    return response.data;
  },

  submitTest: async (testId: string, answers: any): Promise<any> => {
    const response = await api.post(`/students/tests/${testId}/submit`, { answers });
    return response.data;
  },
};
