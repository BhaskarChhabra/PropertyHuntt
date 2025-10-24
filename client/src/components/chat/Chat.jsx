// 👇 ADD forwardRef, useImperativeHandle
import { useContext, useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";
import { format } from "date-fns";
import { Link } from "react-router-dom";

// ... (Keep SendIcon and BackIcon components) ...
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

// 👇 Define the component logic before wrapping
const ChatComponent = ({ chats }, ref) => {
  const [chatList, setChatList] = useState(chats || []);
  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const messageEndRef = useRef();

  const decrease = useNotificationStore((state) => state.decrease);

  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Open chat (Keep this function as is)
  const handleOpenChat = async (id) => {
    // ... (Your existing handleOpenChat logic)
     console.log(`[Chat.jsx] handleOpenChat: Opening chat ID: ${id}`);
    try {
      const res = await apiRequest("/chats/" + id);
      console.log("[Chat.jsx] handleOpenChat: Fetched chat data:", res.data);

      const chatInList = chatList.find((c) => c.id === id);
      // Ensure seenBy is an array before checking includes
      const seenByArray = Array.isArray(chatInList?.seenBy) ? chatInList.seenBy : [];

      if (chatInList && !seenByArray.includes(currentUser.id)) {
        console.log(
          "[Chat.jsx] handleOpenChat: Chat was unread, decreasing count."
        );
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

  // --- 👇 EXPOSE FUNCTION TO PARENT ---
  useImperativeHandle(ref, () => ({
    openSpecificChat: (chatId) => {
      console.log(`[Chat.jsx] Received call to openSpecificChat: ${chatId}`);
      handleOpenChat(chatId); // Call the internal function
    },
  }));
  // --- 👆 END EXPOSE FUNCTION ---


  // Send message
  const handleSubmit = async (e) => {
    // ... (Your existing handleSubmit logic)
      e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if (!text || !chat) return;

    console.log(`[Chat.jsx] handleSubmit: Sending message: "${text}"`);
    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      console.log("[Chat.jsx] handleSubmit: Message saved to DB:", res.data);

       // Check if previous state and messages exist before spreading
      setChat((prev) => ({
        ...(prev || {}), // Ensure prev exists
        messages: [...(prev?.messages || []), res.data] // Ensure prev.messages exists
      }));

      e.target.reset();

      const receiver = getReceiver(chat);
      if (!receiver) {
         console.error("[Chat.jsx] handleSubmit Error: Could not find receiver in chat.");
         return; // Stop if receiver is not found
      }

      const socketPayload = {
        receiverId: receiver.id,
        chatId: chat.id,
        data: res.data,
      };

      console.log(
        "[Chat.jsx] handleSubmit: EMITTING 'sendMessage' via socket:",
        socketPayload
      );
      if(socket) socket.emit("sendMessage", socketPayload); // Check if socket exists

      if(socket) socket.emit("typing", { // Check if socket exists
        chatId: chat.id,
        isTyping: false,
      });
    } catch (err) {
      console.error("[Chat.jsx] handleSubmit Error:", err);
    }
  };

  // --- Socket Listeners ---
  useEffect(() => {
    // ... (Your existing socket useEffect logic)
     if (!socket) {
      console.warn("[Chat.jsx] Socket context not ready yet.");
      return;
    }
    console.log("[Chat.jsx] Socket Listeners attached (typing, getMessage).");

    // Typing
    const typingListener = ({ chatId, isTyping }) => {
      if (chat?.id === chatId) {
        setIsTyping(isTyping);
      }
    };
    socket.on("userTyping", typingListener);

    // Message listener
    const messageListener = (data) => {
      console.log("[Chat.jsx] Socket Event 'getMessage' RECEIVED:", data);

      // 1. Update current open chat
      if (chat?.id === data.chatId) {
        console.log(
          "[Chat.jsx] Message is for currently open chat. Updating state."
        );
        setChat((prev) => {
          // Avoid adding duplicate messages if received rapidly
           // Ensure prev and prev.messages exist
          if (prev && Array.isArray(prev.messages) && prev.messages.find(msg => msg && msg.id === data.id)) {
            return prev;
          }
           // Ensure prev exists before spreading, default messages to empty array
          return { ...(prev || {}), messages: [...(prev?.messages || []), data] };
        });
        read(data.chatId);
      }

      // 3. Chat list (left side) ko hamesha update karein
      setChatList((prevList = []) => { // Default to empty array
        console.log("[Chat.jsx] Updating chat list (left side)...");
        const list = Array.isArray(prevList) ? prevList : []; // Ensure it's an array
        const chatToUpdate = list.find((c) => c && c.id === data.chatId);
        const otherChats = list.filter((c) => c && c.id !== data.chatId);

        if (chatToUpdate) {
          // Ensure seenBy exists and is an array before filtering
          const seenByArray = Array.isArray(chatToUpdate.seenBy) ? chatToUpdate.seenBy : [];
          // Ensure currentUser exists before accessing id
          const currentUserId = currentUser?.id;
          const updatedChat = {
            ...chatToUpdate,
            lastMessage: data.text,
             updatedAt: data.createdAt, // Update timestamp for sorting
             // Filter only if currentUserId is defined
            seenBy: currentUserId ? seenByArray.filter((id) => id !== currentUserId) : seenByArray,
          };
          // Sort again after update, ensuring elements have updatedAt
           return [updatedChat, ...otherChats].sort((a, b) =>
             new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0)
           );
        }
        // If chat is not in the list (maybe a new chat initiated by other user)
        // You might need to fetch the new chat details here or handle it differently
        console.warn("[Chat.jsx] Received message for a chat not in the current list:", data.chatId);
        return list; // Return the original list if chat not found
      });
    };
    socket.on("getMessage", messageListener);

    // Cleanup listeners
    return () => {
      console.log(
        "[Chat.jsx] Socket Listeners cleaning up (typing, getMessage)."
      );
      if (socket) { // Check if socket exists before removing listeners
         socket.off("userTyping", typingListener);
         socket.off("getMessage", messageListener);
      }
    };
  }, [socket, chat, currentUser?.id, decrease]); // Added optional chaining for currentUser.id


  // Update list jab prop change ho
  useEffect(() => {
    // Only update if the incoming chats prop is different
     // Check if chats is defined before stringifying
     if (chats && JSON.stringify(chats) !== JSON.stringify(chatList)) {
       setChatList(chats || []);
     } else if (!chats && chatList.length > 0) {
        // Handle case where chats becomes null/undefined but chatList still has items
        setChatList([]);
     }
  }, [chats]); // Removed chatList from dependency array


  // Mark as read
  const read = async (chatId) => {
    // ... (Your existing read logic)
     console.log(`[Chat.jsx] read: Marking chat ${chatId} as read.`);
     // Ensure currentUser exists before proceeding
     if (!currentUser?.id) {
       console.warn("[Chat.jsx] read: currentUser not available.");
       return;
     }
    try {
      await apiRequest.put("/chats/read/" + chatId);
      setChatList((prev = []) => // Default to empty array
        (Array.isArray(prev) ? prev : []).map((c) => { // Ensure prev is an array
          if (c && c.id === chatId) {
            // Ensure seenBy is an array before spreading
             const seenByArray = Array.isArray(c.seenBy) ? c.seenBy : [];
             // Avoid adding duplicate user ID
             if (!seenByArray.includes(currentUser.id)) {
                return { ...c, seenBy: [...seenByArray, currentUser.id] };
             }
          }
          return c;
        })
      );
    } catch (err) {
      console.error("[Chat.jsx] read Error:", err);
    }
  };

  // Receiver data nikaalein
  const getReceiver = (chat) => {
    // ... (Your existing getReceiver logic)
      if (!chat || !Array.isArray(chat.users)) return null; // Check if users is an array
      // Ensure currentUser exists before accessing id
      const currentUserId = currentUser?.id;
      if (!currentUserId) return null; // Return null if currentUser is not loaded yet
    return chat.users.find((user) => user && user.id !== currentUserId);
  };

  // Search Logic
  const filteredChats = useMemo(() => {
    // ... (Your existing filteredChats logic)
      if (!searchQuery) return Array.isArray(chatList) ? chatList : []; // Ensure returning array
    if (!Array.isArray(chatList)) return [];
    return chatList.filter((c) => {
       if (!c) return false; // Skip if chat item is null/undefined
      const receiver = getReceiver(c);
      // Optional chaining for safety
      return receiver?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [chatList, searchQuery, currentUser?.id]); // Add currentUser.id as dependency


  // Typing Handler
  const handleTyping = (e) => {
    // ... (Your existing handleTyping logic)
      if (!socket || !chat) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

     // Check socket connection state if available (optional but good practice)
     // if (socket.connected) {
         socket.emit("typing", { chatId: chat.id, isTyping: true });
     // }

    typingTimeoutRef.current = setTimeout(() => {
       if(socket) socket.emit("typing", { chatId: chat.id, isTyping: false }); // Check socket exists
    }, 3000);
  };


  return (
    <div className="chat">
      {/* Chat List (Left) */}
      <div className={`chat-list-container ${chat ? "mobile-hidden" : ""}`}>
         {/* ... (Your existing chat list JSX, ensure null checks for 'c' and 'receiver') ... */}
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
          {/* Add checks for filteredChats being an array and c being valid */}
          {/* Ensure currentUser is loaded before rendering */}
           {currentUser && Array.isArray(filteredChats) && filteredChats.map((c) => {
             if (!c || !c.id) return null; // Skip if chat item is invalid
            const receiver = getReceiver(c);
            if (!receiver) {
              // This might happen temporarily if currentUser is not yet loaded in getReceiver
              // console.warn(
              //   "Skipping chat render, receiver not found in chat:",
              //   c
              // );
              return null;
            }
            const isOnline = onlineUsers.includes(receiver.id);
            // Ensure c.seenBy is an array before checking includes
            const seenByArray = Array.isArray(c.seenBy) ? c.seenBy : [];
            const isUnread = !seenByArray.includes(currentUser.id); // currentUser definitely exists here

            return (
              <div
                className={`chat-list-item ${isUnread ? "unread" : ""} ${
                  chat?.id === c.id ? "active" : ""
                }`}
                key={c.id}
                onClick={() => handleOpenChat(c.id)}
              >
                <div className="avatar-container">
                  <img src={receiver.avatar || "/noavatar.jpg"} alt="Avatar" />
                  {isOnline && <div className="online-dot"></div>}
                </div>
                <div className="text-container">
                  <span>{receiver.username}</span>
                  {/* Ensure lastMessage exists */}
                  <p>{c.lastMessage || 'No messages yet'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Box (Right) */}
      <div className="chatBox">
        {chat ? (
          <>
             {/* ... (Your existing chat box JSX, ensure receiver exists before accessing properties) ... */}
              <div className="top">
              <div className="user">
                <button className="back-btn" onClick={() => setChat(null)}>
                  <BackIcon />
                </button>
                <div className="avatar-container">
                  <img
                    // Add optional chaining for safety
                    src={getReceiver(chat)?.avatar || "/noavatar.jpg"}
                    alt=""
                  />
                   {/* Add check for receiver before checking onlineUsers */}
                  {getReceiver(chat) && onlineUsers.includes(getReceiver(chat)?.id) && (
                    <div className="online-dot"></div>
                  )}
                </div>
                <div className="user-details">
                   {/* Add optional chaining */}
                  <span>{getReceiver(chat)?.username || 'User'}</span>
                  {/* Add check for receiver */}
                  <p>
                    {(getReceiver(chat) && onlineUsers.includes(getReceiver(chat)?.id))
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
              <span className="close" onClick={() => setChat(null)}>
                {" "}
                X{" "}
              </span>
            </div>

            {/* Property Context Bar - check if post exists */}
            {chat.post && (
              <div className="chat-context">
                <img
                  // Check if images array exists and has elements
                  src={chat.post.images?.[0] || "/noimg.png"}
                  alt="Property"
                />
                <div className="context-details">
                   {/* Check if title exists */}
                  <p>{chat.post.title || 'Property Title'}</p>
                   {/* Check if price exists */}
                  <strong>
                    ₹ {(chat.post.price || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
                 {/* Ensure post.id exists before creating link */}
                {chat.post.id && (
                   <Link to={`/${chat.post.id}`} className="view-btn">
                     View
                   </Link>
                )}
              </div>
            )}

            <div className="center">
               {/* Check if messages is an array */}
               {/* Ensure currentUser is loaded before rendering messages */}
              {currentUser && Array.isArray(chat.messages) && chat.messages.map((message) => {
                 if (!message || !message.id) return null; // Skip invalid messages
                 return (
                    <div
                      className={
                        message.userId === currentUser.id // currentUser exists here
                          ? "chatMessage own"
                          : "chatMessage"
                      }
                      key={message.id}
                    >
                      <p>{message.text}</p>
                      {/* Check if createdAt is valid */}
                      <span>{message.createdAt ? format(new Date(message.createdAt), "p") : ''}</span>
                    </div>
                 );
              })}
              {/* Typing indicator */}
              {isTyping && (
                <div className="chatMessage">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
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
                key={chat.id} // Add key to reset textarea on chat change
              ></textarea>
              <button className="send-button">
                <SendIcon />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <h2>Start a Conversation</h2>
            <p>
              Select a chat from the left panel to view messages or initiate a
              new discussion about a property.
            </p>
            <div className="divider"></div>
          </div>
        )}
      </div>
    </div>
  );
}; // 👈 Define the component logic separately

// 👇 Wrap the component logic with forwardRef and export default
const Chat = forwardRef(ChatComponent);

export default Chat;

