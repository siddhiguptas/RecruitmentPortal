import { NotificationService } from "./server/services/notificationService";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("Attempting to send test email...");

NotificationService.sendInstantUpdate(
  "harkeshyadav20005@gmail.com",
  "Test from Recruitment Portal",
  "Woohoo! The automated communication module is working perfectly!"
)
  .then(() => console.log("Test finished executing."))
  .catch((err) => console.error("Test failed:", err));
