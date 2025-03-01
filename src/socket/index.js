import jwt from "jsonwebtoken";
import { Server } from "socket.io";

let io;

const initSocket = (server) => {
  if (!server) {
    throw new Error("Server instance is required to initialize Socket.IO");
  }

  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS.split(","),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("\x1b[33m[SOCKET]\x1b[0m No token provided");
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("\x1b[33m[SOCKET]\x1b[0m Invalid token:", err.message);
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    if (!user || !user.uid) {
      console.error("\x1b[33m[SOCKET]\x1b[0m Invalid user data");
      return socket.disconnect(true);
    }

    socket.join(user.uid);
    console.log(`\x1b[33m[SOCKET]\x1b[0m User '${user.uid}' connected`);

    socket.on("disconnect", (reason) => {
      console.log(
        `\x1b[33m[SOCKET]\x1b[0m User '${user.uid}' disconnected:`,
        reason
      );
    });
  });
};

const getSocket = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized. Call initSocket first.");
  }
  return io;
};

export { initSocket, getSocket };
