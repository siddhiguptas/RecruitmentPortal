import api from "./api";
import { Analytics, StudentProfile, Job } from "../types";

export const adminService = {
  getAnalytics: async (): Promise<Analytics> => {
    const response = await api.get("/admin/analytics");
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

  getAllStudents: async (): Promise<StudentProfile[]> => {
    const response = await api.get("/admin/students");
    return response.data;
  },

  getAllRecruiters: async (): Promise<any[]> => {
    const response = await api.get("/admin/recruiters");
    return response.data;
  },
};
