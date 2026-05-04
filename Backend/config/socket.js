const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";

const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    connectedUsers.set(socket.user.id, socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.id} joined room: ${roomId}`);
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.id} left room: ${roomId}`);
    });

    socket.on("send-message", (data) => {
      const { roomId, message, type } = data;
      socket.to(roomId).emit("receive-message", {
        userId: socket.user.id,
        message,
        type,
        timestamp: new Date()
      });
    });

    socket.on("typing", (data) => {
      const { roomId } = data;
      socket.to(roomId).emit("user-typing", { userId: socket.user.id });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
      connectedUsers.delete(socket.user.id);
    });
  });

  return io;
};

const getSocketId = (userId) => {
  return connectedUsers.get(userId);
};

module.exports = { initializeSocket, getSocketId, connectedUsers };