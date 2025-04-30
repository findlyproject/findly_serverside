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
 

  // Join Room
  socket.on("joinRoom", (userId) => {
    
    socket.join(userId); 
  });

  socket.on("newMessage", (data) => {
   
    io.to(data.to).emit("receiveMessage", {
      message: data.message,
      from: data.from,
    });
  });

  // Handle group room joining
  socket.on("joingrouproom", (groupId) => {
   
    socket.join(groupId);
  });

  // Handle group messages
  socket.on("groupMessage", (data) => {
 
    io.to(data.groupId).emit("receiveGroupMessage", {
      message: data.message,
      from: data.from,
    });
  });

  socket.on("disconnect", () => {
   
  });
});

app.set("io", io);

export {server, app,express,io};
