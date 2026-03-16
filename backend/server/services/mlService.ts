import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experience_years?: number;
  cgpa?: number;
  education?: Array<{
    raw_text?: string;
    degree?: string;
    institution?: string;
    start_year?: string;
    end_year?: string;
    cgpa?: number;
  }>;
  experience?: string[];
}

interface JobRecommendationResponse {
  jobs: Array<{
    jobId?: string;
    job_title: string;
    match_score: number;
    skill_score?: number;
    experience_score?: number;
    cgpa_score?: number;
    recommendation?: string;
  }>;
}

interface MatchJobResponse {
  match_score: number;
  matched_skills?: string[];
  missing_skills?: string[];
  recommendation?: string;
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

    try {
      const response = await axios.post<ParsedResumeData>(
        `${ML_SERVICE_URL}/parse-resume`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000 // 30 second timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("ML Service parseResume error:", error.message);
      throw new Error(`ML service unavailable: ${error.message}`);
    }
  },

  async parseResumeBuffer(buffer: Buffer, filename: string): Promise<ParsedResumeData> {
    const form = new FormData();
    form.append("file", buffer, { filename });

    try {
      const response = await axios.post<ParsedResumeData>(
        `${ML_SERVICE_URL}/parse-resume`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("ML Service parseResumeBuffer error:", error.message);
      throw new Error(`ML service unavailable: ${error.message}`);
    }
  },

  async parseResumeText(text: string): Promise<ParsedResumeData> {
    try {
      const response = await axios.post<ParsedResumeData>(
        `${ML_SERVICE_URL}/parse-resume-text`,
        { text },
        { timeout: 10000 }
      );

      return response.data;
    } catch (error: any) {
      console.error("ML Service parseResumeText error:", error.message);
      throw new Error(`ML service unavailable: ${error.message}`);
    }
  },

  async recommendJobs(studentProfile: any, jobs: any[]): Promise<any[]> {
    if (!studentProfile || !studentProfile.skills || studentProfile.skills.length === 0) {
      console.warn("No skills provided for job recommendations");
      return [];
    }

    if (!jobs || jobs.length === 0) {
      return [];
    }

    try {
      const response = await axios.post<JobRecommendationResponse>(
        `${ML_SERVICE_URL}/recommend-jobs`,
        {
          student: studentProfile,
          jobs: jobs.map((job) => ({
            jobId: job._id?.toString?.() || job._id,
            title: job.title,
            description: job.description
          }))
        },
        { timeout: 30000 }
      );

      return response.data.jobs;
    } catch (error: any) {
      console.error("ML Service recommendJobs error:", error.message);
      // Return empty array instead of throwing to allow app to continue
      return [];
    }
  },

  async matchJob(resumeData: ParsedResumeData, jobDescription: string): Promise<MatchJobResponse> {

    try {
      const response = await axios.post<MatchJobResponse>(
        `${ML_SERVICE_URL}/match-job`,
        {
          skills: resumeData.skills || [],
          experience_years: resumeData.experience_years || 0,
          cgpa: resumeData.cgpa,
          job_description: jobDescription
        },
        { timeout: 15000 }
      );

      return response.data;
    } catch (error: any) {
      console.error("ML Service matchJob error:", error.message);
      throw new Error(`ML service unavailable: ${error.message}`);
    }
  },

  async rankCandidates(job: any, candidates: any[]): Promise<any[]> {

    try {
      const response = await axios.post<RankCandidatesResponse>(
        `${ML_SERVICE_URL}/rank-candidates`,
        {
          job: {
            jobId: job._id?.toString?.() || job._id,
            title: job.title || "Unknown",
            description: job.description || ""
          },
          candidates
        },
        { timeout: 30000 }
      );

      return response.data.candidates;
    } catch (error: any) {
      console.error("ML Service rankCandidates error:", error.message);
      return [];
    }
  },

  async predictPlacement(
    studentData: PlacementPredictionRequest
  ): Promise<PlacementPredictionResponse> {

    try {
      const response = await axios.post<PlacementPredictionResponse>(
        `${ML_SERVICE_URL}/predict-placement`,
        studentData,
        { timeout: 15000 }
      );

      return response.data;
    } catch (error: any) {
      console.error("ML Service predictPlacement error:", error.message);
      throw new Error(`ML service unavailable: ${error.message}`);
    }
  }

};
