"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.express = exports.app = exports.server = void 0;
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
exports.express = express_1.default;
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
    },
});
exports.io = io;
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
