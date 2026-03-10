import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export const mlService = {
  parseResume: async (filePath: string) => {
    const response = await axios.post(`${ML_SERVICE_URL}/parse-resume`, { filePath });
    return response.data;
  },

  recommendJobs: async (resumeData: any, jobs: any[]) => {
    const response = await axios.post(`${ML_SERVICE_URL}/recommend-jobs`, { resumeData, jobs });
    return response.data;
  },

  matchJob: async (resumeData: any, jobDescription: string) => {
    const response = await axios.post(`${ML_SERVICE_URL}/match-job`, { resumeData, jobDescription });
    return response.data;
  },

  predictPlacement: async (studentData: any) => {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-placement`, { studentData });
    return response.data;
  },

  rankCandidates: async (jobDescription: string, candidates: any[]) => {
    const response = await axios.post(`${ML_SERVICE_URL}/rank-candidates`, { jobDescription, candidates });
    return response.data;
  },
};
