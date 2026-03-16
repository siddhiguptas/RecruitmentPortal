import { Server, Socket } from "socket.io";
import WebSocket from "ws";

const ML_WS_URL = process.env.ML_WS_URL || "ws://localhost:8000/ws/proctor";

export const initProctorSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    let mlWs: WebSocket | null = null;

    socket.on("start_exam", () => {
      console.log(`Exam started for user: ${socket.id}`);

      if (mlWs && mlWs.readyState === WebSocket.OPEN) {
        return;
      }
      
      // Initialize connection to ML proctoring service
      mlWs = new WebSocket(ML_WS_URL);

      mlWs.on("open", () => {
        console.log("Connected to ML Proctoring Service");
      });

      mlWs.on("message", (data: any) => {
        try {
          const result = JSON.parse(data.toString());
          // If ML service detects suspicious activity, emit cheating_alert
          if (result.is_suspicious || result.suspicious || result.alert) {
            const payload = {
              ...result,
              message: result.message || result.alert || "Suspicious activity detected",
            };
            socket.emit("cheating_alert", payload);
            socket.emit("proctoring_alert", payload);
          }
        } catch (error) {
          console.error("Error parsing ML proctoring message:", error);
        }
      });

      mlWs.on("error", (error: any) => {
        console.error("ML Proctoring WebSocket Error:", error);
        socket.emit("proctor_connection_error", {
          message: "Proctoring service unavailable",
        });
      });

      mlWs.on("close", () => {
        console.log("ML Proctoring Service connection closed");
      });
    });

    socket.on("video_frame", (payload: any) => {
      // Forward base64 frame to ML service
      const frame = typeof payload === "string" ? payload : payload?.frame;
      if (mlWs && mlWs.readyState === WebSocket.OPEN) {
        if (typeof frame === "string" && frame.length > 0) {
          mlWs.send(frame);
        }
      }
    });

    socket.on("exam_end", () => {
      console.log(`Exam ended for user: ${socket.id}`);
      if (mlWs) {
        mlWs.close();
        mlWs = null;
      }
    });

    socket.on("disconnect", () => {
      if (mlWs) {
        mlWs.close();
        mlWs = null;
      }
    });
  });
};
