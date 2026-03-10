import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";
import { Notification } from "../models/Notification";
import { AuthRequest } from "../types";

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

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (userId: string, title: string, message: string, type: string = "general", relatedId?: string) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId,
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};
