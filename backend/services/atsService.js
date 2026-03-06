const axios = require("axios");

// temporary storage (later DB use kar sakte ho)
let applications = [];


// apply job
exports.applyJob = async (data) => {

  const { studentName, jobRole, resumeText, jobDescription } = data;

  // ML service call
  const response = await axios.post(
    "http://127.0.0.1:8000/match-job",
    {
      resume_text: resumeText,
      job_description: jobDescription
    }
  );

  const score = response.data.score;

  const application = {
    id: Date.now(),
    studentName,
    jobRole,
    score,
    status: "Applied"
  };

  applications.push(application);

  return application;
};



// ATS pipeline
exports.getPipeline = async () => {

  const pipeline = {
    Applied: [],
    Shortlisted: [],
    Interview: [],
    Offered: [],
    Rejected: []
  };

  applications.forEach(app => {
    pipeline[app.status].push(app);
  });

  return pipeline;
};



// update stage
exports.updateStatus = async (id, status) => {

  const app = applications.find(a => a.id == id);

  if (!app) {
    throw new Error("Application not found");
  }

  app.status = status;

  return app;
};
