import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";

export const triggerNotification = async (req: Request, res: Response) => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    return res.status(400).json({ error: "Missing required fields: email, subject, or message" });
  }

  try {
    await NotificationService.sendInstantUpdate(email, subject, message);
    res.status(200).json({ success: true, message: "Communication triggered successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to send communication." });
  }
};
