import { Request, Response } from "express";
import {
  applyJob as applyJobService,
  getPipeline as getPipelineService,
  updateStatus as updateStatusService,
} from "../services/atsService";

import { mlService } from "../services/mlService";

export const parseResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filename = req.file.originalname || "resume.pdf";
    const parsedData = await mlService.parseResumeBuffer(req.file.buffer, filename);

    res.json(parsedData);

  } catch (error) {
    res.status(500).json({ message: "Resume parsing failed" });
  }
};

export const applyJob = async (req: Request, res: Response) => {
  try {
    const result = await applyJobService(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply for job";
    res.status(500).json({ error: message });
  }
};

export const getPipeline = async (_req: Request, res: Response) => {
  try {
    const data = await getPipelineService();
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch ATS pipeline";
    res.status(500).json({ error: message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    const result = await updateStatusService(id, status);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    res.status(500).json({ error: message });
  }
};


