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

  getFilteredJobs: async (filters?: {
    jobType?: string;
    location?: string;
    skills?: string[];
    minSalary?: string;
  }): Promise<Job[]> => {
    const params = new URLSearchParams();
    if (filters?.jobType) params.append('jobType', filters.jobType);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.skills) filters.skills.forEach(skill => params.append('skills', skill));
    if (filters?.minSalary) params.append('minSalary', filters.minSalary);

    const response = await api.get(`/students/jobs?${params.toString()}`);
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

  getNotifications: async (): Promise<any[]> => {
    const response = await api.get("/notifications");
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string): Promise<any> => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  updateProfileComprehensive: async (profileData: Partial<StudentProfile>): Promise<StudentProfile> => {
    const response = await api.put("/students/profile/comprehensive", profileData);
    return response.data;
  },

  getPlacementPrediction: async (): Promise<any> => {
    const response = await api.get("/students/placement-prediction");
    return response.data;
  },

  verifyEligibility: async (): Promise<any> => {
    const response = await api.post("/students/verify-eligibility");
    return response.data;
  },

 

  startTest: async (testId: string): Promise<any> => {
    const response = await api.post(`/tests/${testId}/start`);
    return response.data;
  },

 
  getTestResults: async (): Promise<any[]> => {
    const response = await api.get("/tests/results");
    return response.data;
  },
};
