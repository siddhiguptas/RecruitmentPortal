const atsService = require("../services/atsService");

// student applies for job
exports.applyJob = async (req, res) => {
  try {
    const result = await atsService.applyJob(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// recruiter ATS pipeline
exports.getPipeline = async (req, res) => {
  try {
    const data = await atsService.getPipeline();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// recruiter changes stage
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await atsService.updateStatus(id, status);
    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
