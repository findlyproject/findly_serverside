import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import express from "express";
dotenv.config();
const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join Room
  socket.on("joinRoom", (userId) => {
    console.log(`User joined room: ${userId}`);
    socket.join(userId); // Join a room with the user ID
  });

  // Listen for new messages and emit to the recipient's room
  socket.on("newMessage", (data) => {
    console.log("New message received on server:", data);
    io.to(data.to).emit("receiveMessage", {
      message: data.message,
      from: data.from,
    });
  });

  // Handle group room joining
  socket.on("joingrouproom", (groupId) => {
    console.log(`User joined group room: ${groupId}`);
    socket.join(groupId);
  });

  // Handle group messages
  socket.on("groupMessage", (data) => {
    console.log("Group message received:", data);
    io.to(data.groupId).emit("receiveGroupMessage", {
      message: data.message,
      from: data.from,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.set("io", io);

export { server, app, express, io };
