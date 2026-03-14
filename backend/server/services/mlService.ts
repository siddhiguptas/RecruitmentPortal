import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export const mlService = {

  async parseResume(filePath: string) {

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      `${ML_SERVICE_URL}/parse-resume`,
      form,
      {
        headers: form.getHeaders()
      }
    );

    return response.data;
  },

  async recommendJobs(studentProfile: any, jobs: any[]) {

    const response = await axios.post(
      `${ML_SERVICE_URL}/recommend-jobs`,
      {
        student: studentProfile,
        jobs: jobs
      }
    );

    return response.data.jobs;
  },

  async matchJob(resumeData: any, jobDescription: string) {

    const response = await axios.post(
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

  async rankCandidates(job: any, candidates: any[]) {

    const response = await axios.post(
      `${ML_SERVICE_URL}/rank-candidates`,
      {
        job,
        candidates
      }
    );

    return response.data.candidates;
  }

};