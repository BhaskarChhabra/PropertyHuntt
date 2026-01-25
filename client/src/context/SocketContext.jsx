import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
// --- [NAYA] Notification store ko import karein ---
import { useNotificationStore } from "../lib/notificationStore";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // --- [NAYA] Notification store se 'increase' function lein ---
  const { increase } = useNotificationStore();

  // Connection ke liye useEffect
  useEffect(() => {
    // Apne .env file se URL lein ya fallback karein
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8800'; 
    console.log(`[SocketContext] Attempting to connect to Socket.IO server at: ${SOCKET_URL}`);

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log(`[SocketContext] ✅ Successfully connected to Socket.IO server with ID: ${newSocket.id}`);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SocketContext] ❌ Failed to connect to Socket.IO server:', error.message);
    });

    return () => {
      if (newSocket) {
        console.log('[SocketContext] Closing socket connection');
        newSocket.close();
      }
    };
  }, []); // Yeh sirf ek baar chalega

  // User/Notification listeners ke liye useEffect
  useEffect(() => {
    if (socket && currentUser) {
      console.log(`[SocketContext] User ${currentUser.id} found. Emitting "newUser".`);
      socket.emit("newUser", currentUser.id);

      // Online users ki list lein (Yeh pehle se tha)
      const onlineUserListener = (users) => {
        console.log("[SocketContext] Received 'getOnlineUsers' event. Online users:", users);
        setOnlineUsers(users); 
      };
      socket.on("getOnlineUsers", onlineUserListener);

      // --- [YAHI HAI ASLI FIX] ---
      // Server se naye message/notification ko sunein
      const notificationListener = (notification) => {
        console.log("[SocketContext] Received 'getNotification' event:", notification);
        increase(); // Notification count badhayein
      };
      
      socket.on("getNotification", notificationListener);
      // -----------------------------

      // Cleanup
      return () => {
        console.log("[SocketContext] Cleaning up listeners ('getOnlineUsers', 'getNotification').");
        socket.off("getOnlineUsers", onlineUserListener);
        socket.off("getNotification", notificationListener); // <-- Cleanup
      };
    } else if (socket && !currentUser) {
       console.log("[SocketContext] Socket is on, but no currentUser found yet.");
    }
  }, [socket, currentUser, increase]); // <-- 'increase' ko dependency mein add karein

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};