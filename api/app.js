import dotenv from "dotenv";
dotenv.config();
import "./lib/googleStrategy.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import axios from "axios"; 
import https from "https";
import httpAgent from "http"; 

// ===== Routes =====
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import mapRoute from "./routes/map.route.js"
import aiRoute from './routes/ai.route.js'; 
// ===== Path helpers (Ab zaruri nahi, lekin rehne dete hain) =====
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const server = http.createServer(app);

// Axios config
axios.defaults.proxy = false; 
axios.defaults.httpAgent = new httpAgent.Agent({ keepAlive: true, proxy: false });
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true, proxy: false });

// Allowed origins (Updated and simplified for clarity)
const VERCEL_CLIENT = "https://localhost:5173"; // Vercel Frontend URL

const allowedOrigins = [
    "http://localhost:5173", // Local Development
    VERCEL_CLIENT, // Vercel Frontend URL
];

// FIX 1: Add dynamic environment variable if it exists (e.g. for Vercel preview deploys)
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
    allowedOrigins.push(process.env.CLIENT_URL);
}


// Middlewares
app.use(
    cors({
        origin(origin, callback) {
            // Allows requests with no origin (like server-to-server or cURL) and allowed origins
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            // Log the rejected origin for debugging
            console.error(`CORS BLOCKED: Origin ${origin} not in allowed list.`);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// ===== Socket.IO Setup (FIXED) =====
const io = new Server(server, {
    cors: {
        // Use the same allowedOrigins array for Socket.IO
        origin: allowedOrigins, 
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});

app.set("socketio", io);

let onlineUsers = []; 

const addUser = (userId, socketId) => {
    const exists = onlineUsers.find((u) => u.userId === userId);
    // [FIX] Check karein ki userId null nahi hai
    if (!exists && userId) { 
        onlineUsers.push({ userId, socketId });
        console.log(`[SOCKET.IO] User ADDED: ${userId}. Total online: ${onlineUsers.length}`);
    }
};

const removeUser = (socketId) => {
    const user = onlineUsers.find(u => u.socketId === socketId);
    onlineUsers = onlineUsers.filter((u) => u.socketId !== socketId);
    if(user) {
        console.log(`[SOCKET.IO] User REMOVED: ${user.userId}. Total online: ${onlineUsers.length}`);
    }
};

const getUser = (userId) => {
    return onlineUsers.find((u) => u.userId === userId);
}

io.on("connection", (socket) => {
    console.log(`✅ [SOCKET.IO] New connection! Socket ID: ${socket.id}`);

    // Register user
    socket.on("newUser", (userId) => {
        addUser(userId, socket.id);
        socket.join(userId); 
        console.log(`[SOCKET.IO] Event "newUser": User ${userId} (Socket ${socket.id}) joined their personal room.`);
        io.emit("getOnlineUsers", onlineUsers.map(u => u.userId)); // Sabko nayi list bhejein
    });

    // Join chat room
    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`[SOCKET.IO] Event "joinChat": Socket ${socket.id} joined chat room: ${chatId}`);
    });
    
    // Typing indicator
    socket.on("typing", ({ chatId, isTyping }) => {
        // console.log(`[SOCKET.IO] Event "typing": Chat ID ${chatId}, isTyping: ${isTyping}`);
        socket.to(chatId).emit("userTyping", { chatId, isTyping });
    });

    // Send message (FIXED)
    socket.on("sendMessage", ({ receiverId, chatId, data }) => {
        console.log(`\n[SOCKET.IO] Event: "sendMessage" RECEIVED.`);
        console.log(`   > From Socket: ${socket.id}`);
        console.log(`   > Target Chat ID: ${chatId}`);
        console.log(`   > Target Receiver ID: ${receiverId}`);
        console.log(`   > Message Data:`, data);

        try {
            if (!data || !data.userId) {
                console.error("❌ [SOCKET.IO] Error: Invalid message data.");
                return;
            }
            
            const senderId = data.userId;
            const receiverSocket = getUser(receiverId); // Receiver ka socket dhoondein

            // Message ko room mein bhejien, siwaaye sender ke
            if (chatId) {
                console.log(`   > EMITTING "getMessage" to room: ${chatId} (except sender)`);
                socket.to(chatId).emit("getMessage", data);
            }
            
            // Notification logic
            if (receiverSocket) {
                console.log(`   > Receiver ${receiverId} is ONLINE.`);
                console.log(`   > EMITTING "getNotification" to receiver's personal room: ${receiverId}`);
                io.to(receiverId).emit("getNotification", {
                    senderId: senderId,
                    text: data.text,
                    chatId: data.chatId,
                    createdAt: data.createdAt,
                    isRead: false,
                });
            } else {
                console.log(`   > Receiver ${receiverId} is OFFLINE. No notification socket event sent.`);
            }

        } catch (error) {
            console.error(`❌ [SOCKET.IO] Error in "sendMessage" handler:`, error);
        }
    });

    socket.on("disconnect", () => {
        console.log(`❌ [SOCKET.IO] Socket disconnected: ${socket.id}`);
        removeUser(socket.id);
        io.emit("getOnlineUsers", onlineUsers.map(u => u.userId)); 
    });
});

// ===== API ROUTES =====
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
app.use("/api/map", mapRoute);
app.use('/api/ai', aiRoute); 

// --- Health Check Route ---
app.get("/", (req, res) => {
    res.status(200).json({ message: "PropertyHunt API is running successfully on Render!" });
});


// Start server
const PORT = process.env.PORT || 8800;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`💬 Socket.IO server ready`);
});
