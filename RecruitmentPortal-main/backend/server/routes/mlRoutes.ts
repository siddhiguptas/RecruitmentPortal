import { Router } from "express";
import { getPrediction } from "../controllers/mlController";

const router = Router();

router.post("/predict", getPrediction);

export default router;