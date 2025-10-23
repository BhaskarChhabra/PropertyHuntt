import { useContext, useEffect, useRef, useState, useMemo } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";
import { format } from "date-fns";
import { Link } from "react-router-dom"; 

// --- Send Icon ---
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// --- Back Icon (Mobile) ---
const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);


function Chat({ chats }) {
  const [chatList, setChatList] = useState(chats || []); 
  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const messageEndRef = useRef();

  // --- [YAHAN BADLAV HAI] ---
  // Ab 'increase' ki zaroorat nahi
  const decrease = useNotificationStore((state) => state.decrease);
  // -------------------------

  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null); 
  
  // Auto scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Open chat
  const handleOpenChat = async (id) => {
    console.log(`[Chat.jsx] handleOpenChat: Opening chat ID: ${id}`);
    try {
      const res = await apiRequest("/chats/" + id);
      console.log("[Chat.jsx] handleOpenChat: Fetched chat data:", res.data);
      
      const chatInList = chatList.find((c) => c.id === id);
      if (chatInList && !chatInList.seenBy.includes(currentUser.id)) {
        console.log("[Chat.jsx] handleOpenChat: Chat was unread, decreasing count.");
        decrease();
      }
      
      setChat(res.data);

      if (socket) {
        console.log(`[Chat.jsx] EMITTING "joinChat" for room: ${id}`);
        socket.emit("joinChat", id); 
      }

      read(id); // Mark as read
    } catch (err) {
      console.error("[Chat.jsx] handleOpenChat Error:", err);
    }
  };

  // Send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if (!text || !chat) return;

    console.log(`[Chat.jsx] handleSubmit: Sending message: "${text}"`);
    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      console.log("[Chat.jsx] handleSubmit: Message saved to DB:", res.data);
      
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();

      const receiver = getReceiver(chat);
      const socketPayload = {
        receiverId: receiver.id,
        chatId: chat.id,
        data: res.data, 
      };
      
      console.log("[Chat.jsx] handleSubmit: EMITTING 'sendMessage' via socket:", socketPayload);
      socket.emit("sendMessage", socketPayload); 

      socket.emit("typing", {
        chatId: chat.id,
        isTyping: false,
      });
      
    } catch (err) {
      console.error("[Chat.jsx] handleSubmit Error:", err);
    }
  };

  // --- Socket Listeners ---
  useEffect(() => {
    if (!socket) {
      console.warn("[Chat.jsx] Socket context not ready yet.");
      return;
    }
    console.log("[Chat.jsx] Socket Listeners attached (typing, getMessage).");

    // Typing
    const typingListener = ({ chatId, isTyping }) => {
      if (chat?.id === chatId) {
        // console.log(`[Chat.jsx] Socket Event 'userTyping' RECEIVED: isTyping=${isTyping}`);
        setIsTyping(isTyping);
      }
    };
    socket.on("userTyping", typingListener);

    // Message listener
    const messageListener = (data) => {
      console.log("[Chat.jsx] Socket Event 'getMessage' RECEIVED:", data);
      
      // 1. Update current open chat
      if (chat?.id === data.chatId) {
        console.log("[Chat.jsx] Message is for currently open chat. Updating state.");
        setChat((prev) => ({ ...prev, messages: [...prev.messages, data] }));
        read(data.chatId);
      } 
      // 2. Notification count ab SocketContext handle karega
      
      // 3. Chat list (left side) ko hamesha update karein
      setChatList((prevList) => {
        console.log("[Chat.jsx] Updating chat list (left side)...");
        const chatToUpdate = prevList.find((c) => c.id === data.chatId);
        const otherChats = prevList.filter((c) => c.id !== data.chatId);

        if (chatToUpdate) {
          const updatedChat = {
            ...chatToUpdate,
            lastMessage: data.text,
            // 'seenBy' se currentUser.id ko hata dein taaki woh unread dikhe
            seenBy: chatToUpdate.seenBy.filter(id => id !== currentUser.id)
          };
          
          return [updatedChat, ...otherChats]; // Naye message waali chat ko top par le aayein
        }
        return prevList; // Agar chat list mein nahi hai, toh kuch na karein
      });
    };
    socket.on("getMessage", messageListener);

    // Cleanup listeners
    return () => {
      console.log("[Chat.jsx] Socket Listeners cleaning up (typing, getMessage).");
      socket.off("userTyping", typingListener);
      socket.off("getMessage", messageListener);
    };
  }, [socket, chat, currentUser.id, decrease]); // 'increase' yahan se hata diya
  
  // Update list jab prop change ho
  useEffect(() => {
    setChatList(chats || []); 
  }, [chats]);

  // Mark as read
  const read = async (chatId) => {
    console.log(`[Chat.jsx] read: Marking chat ${chatId} as read.`);
    try {
      await apiRequest.put("/chats/read/" + chatId);
      setChatList((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, seenBy: [...(c.seenBy || []), currentUser.id] } 
            : c
        )
      );
    } catch (err) {
      console.error("[Chat.jsx] read Error:", err);
    }
  };
  
  // Receiver data nikaalein
  const getReceiver = (chat) => {
    if (!chat || !chat.users) return null;
    return chat.users.find((user) => user.id !== currentUser.id);
  };

  // Search Logic
  const filteredChats = useMemo(() => {
    if (!searchQuery) return chatList;
    if (!Array.isArray(chatList)) return []; 
    return chatList.filter((c) => {
      const receiver = getReceiver(c);
      return receiver?.username.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [chatList, searchQuery]);
  
  // Typing Handler
  const handleTyping = (e) => {
    if (!socket || !chat) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    socket.emit("typing", { chatId: chat.id, isTyping: true });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { chatId: chat.id, isTyping: false });
    }, 3000);
  };

  return (
    <div className="chat">
      {/* --- CHAT LIST (LEFT) --- */}
      <div className={`chat-list-container ${chat ? "mobile-hidden" : ""}`}>
        <div className="list-header">
          <h1>Messages</h1>
          <div className="search-bar">
            <img src="/search.png" alt="Search" />
            <input 
              type="search" 
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="chat-list">
          {filteredChats?.map((c) => {
            const receiver = getReceiver(c);
            if (!receiver) {
              console.warn("Skipping chat render, receiver not found in chat:", c);
              return null; 
            }
            const isOnline = onlineUsers.includes(receiver.id); 
            const isUnread = !c.seenBy.includes(currentUser.id);
            
            return (
              <div
                className={`chat-list-item ${isUnread ? "unread" : ""} ${chat?.id === c.id ? "active" : ""}`}
                key={c.id}
                onClick={() => handleOpenChat(c.id)}
              >
                <div className="avatar-container">
                  <img src={receiver.avatar || "/noavatar.jpg"} alt="Avatar" />
                  {isOnline && <div className="online-dot"></div>}
                </div>
                <div className="text-container">
                  <span>{receiver.username}</span>
                  <p>{c.lastMessage}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* --- CHAT BOX (RIGHT) --- */}
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <button className="back-btn" onClick={() => setChat(null)}>
                <BackIcon />
              </button>
              <div className="avatar-container">
                <img src={getReceiver(chat)?.avatar || "/noavatar.jpg"} alt="" />
                {onlineUsers.includes(getReceiver(chat)?.id) && <div className="online-dot"></div>}
              </div>
              <div className="user-details">
                <span>{getReceiver(chat)?.username}</span>
                <p>{onlineUsers.includes(getReceiver(chat)?.id) ? "Online" : "Offline"}</p>
              </div>
            </div>
            <span className="close" onClick={() => setChat(null)}> X </span>
          </div>

          {/* Property Context Bar */}
          {chat.post && (
            <div className="chat-context">
              <img src={chat.post.images[0] || "/noimg.png"} alt="Property" />
              <div className="context-details">
                <p>{chat.post.title}</p>
                <strong>₹ {chat.post.price.toLocaleString("en-IN")}</strong>
              </div>
              <Link to={`/${chat.post.id}`} className="view-btn">
                View
              </Link>
            </div>
          )}
          
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className={message.userId === currentUser.id ? "chatMessage own" : "chatMessage"}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{format(new Date(message.createdAt), "p")}</span>
              </div>
            ))}
            {/* Typing indicator */}
            {isTyping && (
              <div className="chatMessage">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messageEndRef}></div>
          </div>
          
          <form onSubmit={handleSubmit} className="bottom">
            <textarea 
              name="text" 
              placeholder="Type a message..."
              onChange={handleTyping} 
            ></textarea>
            <button className="send-button">
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;