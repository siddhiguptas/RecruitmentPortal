import express from "express";
import { triggerNotification, getNotifications, markAsRead } from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/notify", triggerNotification);
router.get("/", protect, getNotifications);
router.put("/:notificationId/read", protect, markAsRead);

export default router;
