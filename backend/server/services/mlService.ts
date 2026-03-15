import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

interface ParsedResumeData {
  name?: string;
  email?: string;
  skills?: string[];
  experience_years?: number;
  cgpa?: number;
  education?: string[];
}

interface JobRecommendationResponse {
  jobs: any[];
}

interface MatchJobResponse {
  score: number;
  matched_skills: string[];
}

interface RankCandidatesResponse {
  candidates: any[];
}

interface PlacementPredictionRequest {
  skills: string[];
  cgpa: number;
  projects: number;
  internships: number;
}

interface PlacementPredictionResponse {
  placement_probability: number;
}

export const mlService = {

  async parseResume(filePath: string): Promise<ParsedResumeData> {

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post<ParsedResumeData>(
      `${ML_SERVICE_URL}/parse-resume`,
      form,
      {
        headers: form.getHeaders()
      }
    );

    return response.data;
  },

  async recommendJobs(studentProfile: any, jobs: any[]): Promise<any[]> {

    const response = await axios.post<JobRecommendationResponse>(
      `${ML_SERVICE_URL}/recommend-jobs`,
      {
        student: studentProfile,
        jobs: jobs
      }
    );

    return response.data.jobs;
  },

  async matchJob(resumeData: ParsedResumeData, jobDescription: string): Promise<MatchJobResponse> {

    const response = await axios.post<MatchJobResponse>(
      `${ML_SERVICE_URL}/match-job`,
      {
        skills: resumeData.skills,
        experience_years: resumeData.experience_years,
        cgpa: resumeData.cgpa,
        job_description: jobDescription
      }
    );

    return response.data;
  },

  async rankCandidates(job: any, candidates: any[]): Promise<any[]> {

    const response = await axios.post<RankCandidatesResponse>(
      `${ML_SERVICE_URL}/rank-candidates`,
      {
        job,
        candidates
      }
    );

    return response.data.candidates;
  },

  async predictPlacement(
    studentData: PlacementPredictionRequest
  ): Promise<PlacementPredictionResponse> {

    const response = await axios.post<PlacementPredictionResponse>(
      `${ML_SERVICE_URL}/predict-placement`,
      studentData
    );

    return response.data;
  }

};