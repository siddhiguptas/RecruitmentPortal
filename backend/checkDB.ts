import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { User } from "./server/models/User.js";
import { StudentProfile } from "./server/models/StudentProfile.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const users = await User.countDocuments();
  const students = await User.countDocuments({ role: "student" });
  const profiles = await StudentProfile.countDocuments();
  console.log({ users, students, profiles });
  process.exit(0);
}

check();
