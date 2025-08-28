import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins for CORS (Dev + Production)
const allowedOrigins = [
  "http://localhost:5173", // Dev
  process.env.CLIENT_URL || "" // Prod (if any)
];

// ✅ Express CORS middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ Make io available in controllers via req.app.get('socketio')
app.set("socketio", io);

// ===== Socket.IO Logic (rooms + direct user channel) =====
let onlineUsers = []; // [{ userId, socketId }]

const addUser = (userId, socketId) => {
  const exists = onlineUsers.find((u) => u.userId === userId);
  if (!exists) onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => onlineUsers.find((u) => u.userId === userId);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // User logged in: register their socket for direct pushes if needed
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    socket.join(userId); // user room (optional convenience)
    console.log(`User ${userId} -> socket ${socket.id}`);
  });

  // Client opens a specific chat → join that chat room for realtime updates
 // In your server.js file

socket.on("sendMessage", (payload) => {
  try {
    // Validate the incoming data to prevent crashes
    const { receiverId, message } = payload;
    if (!message || !receiverId || !message.userId) {
      console.error("Invalid sendMessage payload received:", payload);
      return;
    }

    const senderId = message.userId;

    console.log(`Relaying message from ${senderId} to ${receiverId}`);

    // ✅ Send the message to the receiver's personal room. This is correct.
    io.to(receiverId).emit("getMessage", message);

    // ✅ Send the message to the sender's personal room (for their other devices).
    io.to(senderId).emit("getMessage", message);

  } catch (error) {
    // Catch any unexpected errors to keep the server running
    console.error("Error in sendMessage handler:", error);
  }
});

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("Socket disconnected:", socket.id);
  });
});

// ===== API Routes =====
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

// ===== Serve static files in production =====
// if (process.env.NODE_ENV === "production") {
//   const clientBuildPath = path.join(dirname, "../client/dist");
//   app.use(express.static(clientBuildPath));

//   app.get("*", (req, res) => {
//     if (req.url.startsWith("/assets/")) {
//       const assetPath = path.join(clientBuildPath, req.url);
//       if (path.extname(assetPath)) return res.sendFile(assetPath);
//     }
//     res.sendFile(path.join(clientBuildPath, "index.html"));
//   });
// }

// ===== Start server =====
const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
  console.log(`Socket.IO server is ready to accept connections`);
});
