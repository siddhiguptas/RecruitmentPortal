import { Request, Response } from "express";
import {
  applyJob as applyJobService,
  getPipeline as getPipelineService,
  updateStatus as updateStatusService,
} from "../services/atsService";

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
