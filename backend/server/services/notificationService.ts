import nodemailer from "nodemailer";
import cron from "node-cron";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const NotificationService = {
  sendInstantUpdate: async (email: string, subject: string, message: string) => {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: message,
      });
      console.log(`Update email sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Email Error:", error);
      throw error;
    }
  },
  scheduleReminder: (cronTime: string, email: string, message: string) => {
    cron.schedule(cronTime, () => {
      console.log("Running scheduled reminder task...");
      NotificationService.sendInstantUpdate(email, "Interview Reminder", message);
    });
  },
};
