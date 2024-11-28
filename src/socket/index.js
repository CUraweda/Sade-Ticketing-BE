import jwt from "jsonwebtoken";
import { Server } from "socket.io";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.WEB_URL,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) socket.disconnect(true);

    let data;
    try {
      data = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      socket.disconnect(true);
    }
    if (!data) socket.disconnect(true);

    socket.join(data.uid);
    console.log(`[SOCKET] user '${data.uid}' joined`);

    socket.on("disconnect", () => {
      socket.leave(data.uid);
      console.log(`[SOCKET] user '${data.uid}' disconnected`);
    });
  });
};

const getSocket = () => {
  if (io) return io;
};

export { initSocket, getSocket };
