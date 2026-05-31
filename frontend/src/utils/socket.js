import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (socket) {
    if (socket.connected) return socket;
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    query: { userId },
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Connected to chat socket:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from chat socket");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
