import mlRoutes from "./server/routes/mlRoutes"; // adjust path if needed
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "./server/config/db";
import authRoutes from "./server/routes/authRoutes";
import studentRoutes from "./server/routes/studentRoutes";
import recruiterRoutes from "./server/routes/recruiterRoutes";
import adminRoutes from "./server/routes/adminRoutes";
import notificationRoutes from "./server/routes/notificationRoutes";
import { initProctorSocket } from "./server/services/proctorSocket";
import fs from "fs";
import { fileURLToPath } from "url";
import { triggerNotification } from "./server/controllers/notificationController";
import {
  applyJob as applyJobHandler,
  getPipeline as getPipelineHandler,
  updateStatus as updateStatusHandler,
} from "./server/controllers/atsController";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads/resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function startServer() {
  // Connect to Database
  try {
    await connectDB();
  } catch (err: any) {
    console.error("CRITICAL: Database connection failed. Registration and login will not work.");
    console.error(`Error details: ${err.message}`);
  }

  const app = express();
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: FRONTEND_ORIGIN,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    },
  });

  const PORT = 3000;

  // Middleware
  app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }));
  app.use(express.json());
  app.use(morgan("dev"));

  // Static files for uploads
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Socket.io setup
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_room", (userId) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Initialize AI Proctoring WebSocket Bridge
  initProctorSocket(io);

  // Attach io to request for use in controllers
  app.set("io", io);

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/recruiters", recruiterRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);
  
  app.post("/api/apply-job", applyJobHandler);
  app.get("/api/ats-pipeline", getPipelineHandler);
  app.put("/api/update-status/:id", updateStatusHandler);
  

// 3️⃣ Register ML routes
app.use("/api/ml", mlRoutes);

  app.get("/api/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({ 
      status: "ok", 
      message: "Recruitment Portal Backend is running",
      database: dbStatus
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
