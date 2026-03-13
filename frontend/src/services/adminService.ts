import api from "./api";
import { Analytics, StudentProfile, Job, Recruiter, Application } from "../types";

export const adminService = {
  getAnalytics: async (filters?: Record<string, any>): Promise<Analytics> => {
    const response = await api.get("/admin/analytics", {
      params: filters,
    });
    return response.data;
  },

  verifyStudentEligibility: async (
    studentId: string,
    isEligible: boolean
  ): Promise<StudentProfile> => {
    const response = await api.put(`/admin/students/${studentId}/eligibility`, {
      isEligible,
    });
    return response.data;
  },

  predictPlacement: async (studentId: string, studentData: any): Promise<any> => {
    const response = await api.post(`/admin/students/${studentId}/predict-placement`, studentData);
    return response.data;
  },

  getAllJobs: async (): Promise<Job[]> => {
    const response = await api.get("/admin/jobs");
    return response.data;
  },

  approveJob: async (jobId: string): Promise<Job> => {
    const response = await api.put(`/admin/jobs/${jobId}/approve`);
    return response.data;
  },

  rejectJob: async (jobId: string): Promise<Job> => {
    const response = await api.put(`/admin/jobs/${jobId}/reject`);
    return response.data;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await api.delete(`/admin/jobs/${jobId}`);
  },

  getJobApplications: async (jobId: string): Promise<Application[]> => {
    const response = await api.get(`/admin/jobs/${jobId}/applications`);
    return response.data;
  },

  getAllStudents: async (): Promise<StudentProfile[]> => {
    const response = await api.get("/admin/students");
    return response.data;
  },

  blockStudent: async (id: string): Promise<void> => {
    await api.put(`/admin/students/${id}/block`);
  },

  unblockStudent: async (id: string): Promise<void> => {
    await api.put(`/admin/students/${id}/unblock`);
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/admin/students/${id}`);
  },

  getStudentApplications: async (id: string): Promise<Application[]> => {
    const response = await api.get(`/admin/students/${id}/applications`);
    return response.data;
  },

  getAllRecruiters: async (): Promise<Recruiter[]> => {
    const response = await api.get("/admin/recruiters");
    return response.data;
  },

  approveRecruiter: async (id: string): Promise<any> => {
    const response = await api.put(`/admin/recruiters/${id}/approve`);
    return response.data;
  },

  rejectRecruiter: async (id: string): Promise<any> => {
    const response = await api.put(`/admin/recruiters/${id}/reject`);
    return response.data;
  },

  deleteRecruiter: async (id: string): Promise<void> => {
    await api.delete(`/admin/recruiters/${id}`);
  },

  getRecruiterJobs: async (id: string): Promise<Job[]> => {
    const response = await api.get(`/admin/recruiters/${id}/jobs`);
    return response.data;
  },

  // tests endpoints
  getAllTests: async (): Promise<any[]> => {
    const response = await api.get("/admin/tests");
    return response.data;
  },

  createTest: async (testData: any): Promise<any> => {
    const response = await api.post("/admin/tests", testData);
    return response.data;
  },

  updateTest: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/admin/tests/${id}`, data);
    return response.data;
  },

  deleteTest: async (id: string): Promise<void> => {
    await api.delete(`/admin/tests/${id}`);
  },

  getTestResults: async (id: string): Promise<any[]> => {
    const response = await api.get(`/admin/tests/${id}/results`);
    return response.data;
  },

  addTestQuestion: async (id: string, question: any): Promise<any> => {
    const response = await api.post(`/admin/tests/${id}/questions`, question);
    return response.data;
  },
};
