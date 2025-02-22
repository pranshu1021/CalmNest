const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
app.use(cors()); // Allow frontend connection

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // VS Code Live Server frontend
        methods: ["GET", "POST"]
    }
});

let users = {}; // Store usernames with socket IDs

io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // Handle new user
    socket.on("newUser", (name) => {
        users[socket.id] = name; // Store username with socket ID
        io.emit("userJoined", name);
    });

    // Listen for incoming messages
    socket.on("chatMessage", (msg) => {
      
        
        console.log(`📩 Message received: ${msg}`);
        io.emit("chatMessage", {username: users[socket.id], message:msg}); // Broadcast message to all clients
    
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);

        if (users[socket.id]) {
            io.emit("userLeft", users[socket.id]); // Notify all users
            delete users[socket.id]; // Remove user from list
        }
    });
});

server.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
