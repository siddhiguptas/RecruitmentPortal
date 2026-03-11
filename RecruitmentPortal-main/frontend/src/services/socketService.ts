import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, "");

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on("connect", () => {
      console.log("Connected to Socket.io server");
      const user = localStorage.getItem("user");
      if (user) {
        const { _id } = JSON.parse(user);
        this.socket?.emit("join_room", _id);
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
