import express from "express";
import { triggerNotification } from "../controllers/notificationController";

const router = express.Router();

router.post("/notify", triggerNotification);

export default router;
