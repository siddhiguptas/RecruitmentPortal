import api from "./api";
import { Job, Application } from "../types";

export const recruiterService = {
  postJob: async (jobData: any): Promise<Job> => {
    const response = await api.post("/recruiters/jobs", jobData);
    return response.data;
  },

  getMyJobs: async (): Promise<Job[]> => {
    const response = await api.get("/recruiters/jobs");
    return response.data;
  },

  updateJob: async (jobId: string, jobData: any): Promise<Job> => {
    const response = await api.put(`/recruiters/jobs/${jobId}`, jobData);
    return response.data;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await api.delete(`/recruiters/jobs/${jobId}`);
  },

  getApplicants: async (jobId: string): Promise<Application[]> => {
    const response = await api.get(`/recruiters/jobs/${jobId}/applicants`);
    return response.data;
  },

  getAllApplications: async (): Promise<Application[]> => {
    const response = await api.get("/recruiters/applications");
    return response.data;
  },

  rankCandidates: async (jobId: string): Promise<any[]> => {
    const response = await api.post(`/recruiters/jobs/${jobId}/rank`);
    return response.data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: string,
    feedback?: string
  ): Promise<Application> => {
    const response = await api.put(`/recruiters/applications/${applicationId}/status`, {
      status,
      feedback,
    });
    return response.data;
  },
};
