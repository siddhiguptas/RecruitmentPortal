// backend/controllers/mlController.ts
import { Request, Response } from "express";
import axios from "axios";

interface PredictRequestBody {
  studentId: string;
  resumeText: string;
}

export const getPrediction = async (req: Request, res: Response) => {
  const body: PredictRequestBody = req.body;

  try {
    const response = await axios.post("http://127.0.0.1:8000/predict", body, {
      headers: { "Content-Type": "application/json" },
    });

    res.json(response.data);
  } catch (err) {
    console.error("ML Service error:", err);
    res.status(500).json({ error: "Failed to fetch prediction from ML service" });
  }
};