// 👇 ADD forwardRef, useImperativeHandle
import { useContext, useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { SocketContext } from "../../context/SocketContext";
// 👇 Import BOTH increase and decrease
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
  const [chat, setChat] = useState(null); // The currently open chat details
  const { currentUser } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const messageEndRef = useRef();

  // 👇 Get BOTH increase and decrease from Zustand store
  const { decrease, increase, number } = useNotificationStore((state) => ({
      decrease: state.decrease,
      increase: state.increase,
      number: state.number,
  }));


  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    // Only scroll if a chat is open
    if (chat) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]); // Dependency on messages array


  // --- Open Chat Function ---
  const handleOpenChat = async (id) => {
     console.log(`[Chat.jsx] handleOpenChat: Opening chat ID: ${id}`);
     if (!currentUser?.id) {
         console.warn("[Chat.jsx] handleOpenChat: currentUser not available yet.");
         return;
     }

     // Find the chat in the current list *before* fetching details
      // Ensure chatList is an array before finding
      const currentList = Array.isArray(chatList) ? chatList : [];
      const chatInList = currentList.find((c) => c && c.id === id);

     // Determine if it was unread *before* marking it read
     const wasUnread = chatInList && Array.isArray(chatInList.seenBy) && !chatInList.seenBy.includes(currentUser.id);

     try {
       const res = await apiRequest("/chats/" + id);
       console.log("[Chat.jsx] handleOpenChat: Fetched chat data:", res.data);
       setChat(res.data); // Set the detailed chat data

       if (socket) {
         console.log(`[Chat.jsx] EMITTING "joinChat" for room: ${id}`);
         socket.emit("joinChat", id);
       }

       // Call read function, passing whether it was originally unread
       // This will handle decreasing the count if needed
       read(id, wasUnread);

     } catch (err) {
       console.error("[Chat.jsx] handleOpenChat Error fetching chat details:", err);
        // Maybe show an error to the user here
     }
  };


  // --- Mark as Read Function ---
  const read = async (chatId, wasUnreadInitially) => {
    console.log(`[Chat.jsx] read: Attempting to mark chat ${chatId} as read. Was unread initially: ${wasUnreadInitially}`);
    if (!currentUser?.id) {
        console.warn("[Chat.jsx] read: currentUser not available.");
        return;
    }

    // Check if the chat is currently open - avoid unnecessary UI updates/API calls if already read
    const chatToCheck = chatList.find(c => c && c.id === chatId);
    const isAlreadyMarkedReadInState = chatToCheck && Array.isArray(chatToCheck.seenBy) && chatToCheck.seenBy.includes(currentUser.id);

    // If it was not unread initially AND it's already marked read in state, maybe skip?
    // However, calling the API ensures backend consistency even if UI state is slightly off.
    // Let's proceed with optimistic UI update but use the flag carefully.

    // Update UI optimistically FIRST
    const originalChatList = [...chatList];
    let uiUpdatedFromUnreadToRead = false; // Flag specifically tracks if UI *changed* from unread to read

     setChatList((prev = []) => {
        const list = Array.isArray(prev) ? prev : [];
        let updated = false;
        const newList = list.map((c) => {
          if (c && c.id === chatId) {
             const seenByArray = Array.isArray(c.seenBy) ? c.seenBy : [];
             if (!seenByArray.includes(currentUser.id)) {
                 updated = true; // Mark that UI state was updated *at all*
                 uiUpdatedFromUnreadToRead = true; // Mark that it specifically went from unread to read
                 return { ...c, seenBy: [...seenByArray, currentUser.id] };
             }
          }
          return c;
        });
        return updated ? newList : list; // Only return new array if changed
     });


    try {
      // Call API to mark as read on the backend (always do this for consistency)
      await apiRequest.put("/chats/read/" + chatId);
      console.log(`[Chat.jsx] read: Successfully marked chat ${chatId} as read on backend.`);

      // Decrease count ONLY if the UI state actually changed from unread to read
      if (uiUpdatedFromUnreadToRead) {
          console.log("[Chat.jsx] read: Decreasing notification count because UI changed unread->read.");
          decrease();
      } else {
          console.log("[Chat.jsx] read: Not decreasing count (already read in UI or initial state was read).");
      }

    } catch (err) {
      console.error("[Chat.jsx] read Error marking chat as read on backend:", err);
      // Revert optimistic UI update if backend fails
       if (uiUpdatedFromUnreadToRead) { // Only revert if we actually changed it
          console.log("[Chat.jsx] read: Reverting optimistic UI update due to backend error.");
          setChatList(originalChatList);
       }
    }
  };


  // Expose function to parent (ChatPage)
  useImperativeHandle(ref, () => ({
    openSpecificChat: (chatId) => {
      handleOpenChat(chatId);
    },
  }));

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

      // Add message to the currently open chat state
      setChat((prev) => ({
        ...(prev || {}),
        messages: [...(prev?.messages || []), res.data]
      }));

      e.target.reset(); // Clear input field

      const receiver = getReceiver(chat);
      if (!receiver) {
         console.error("[Chat.jsx] handleSubmit Error: Could not find receiver in chat.");
         return;
      }

      // Emit message via socket
      const socketPayload = { receiverId: receiver.id, chatId: chat.id, data: res.data };
      console.log("[Chat.jsx] handleSubmit: EMITTING 'sendMessage' via socket:", socketPayload);
      if(socket) socket.emit("sendMessage", socketPayload);

      // Emit typing finished event
      if(socket) socket.emit("typing", { chatId: chat.id, isTyping: false });

    } catch (err) {
      console.error("[Chat.jsx] handleSubmit Error:", err);
       // Maybe show an error to the user that message failed to send
    }
  };

  // Socket Listeners Effect
  useEffect(() => {
     if (!socket || !currentUser?.id) { // Ensure currentUser is also ready
      console.warn("[Chat.jsx] Socket context or currentUser not ready yet.");
      return;
    }
    console.log("[Chat.jsx] Socket Listeners attached (typing, getMessage).");

    // --- Typing Listener ---
    const typingListener = ({ chatId, isTyping: remoteIsTyping }) => {
      if (chat?.id === chatId) { setIsTyping(remoteIsTyping); }
    };
    socket.on("userTyping", typingListener);


    // --- Message Listener ---
    const messageListener = (data) => {
      console.log("[Chat.jsx] Socket Event 'getMessage' RECEIVED:", data);
      const isForCurrentChat = chat?.id === data.chatId;

      // --- 👇 LOGIC FOR HANDLING INCOMING MESSAGE ---
      if (isForCurrentChat) {
          // 1. Add message to the open chat window
          console.log("[Chat.jsx] Message is for currently open chat. Updating state.");
          setChat((prev) => {
              if (prev && Array.isArray(prev.messages) && prev.messages.find(msg => msg && msg.id === data.id)) { return prev; }
              return { ...(prev || {}), messages: [...(prev?.messages || []), data] };
          });
          // 2. Mark it as read immediately (don't pass wasUnread=true, count shouldn't decrease here)
          read(data.chatId, false);

      } else {
          // 3. If message is for a *different* chat:
          // Check if this chat is already in our list
          const chatExistsInList = chatList.some(c => c && c.id === data.chatId);
          if (chatExistsInList) {
             // Mark the chat in the list as unread (remove current user from seenBy)
             setChatList((prevList = []) => {
                 const list = Array.isArray(prevList) ? prevList : [];
                 const chatToUpdate = list.find((c) => c && c.id === data.chatId);
                 const otherChats = list.filter((c) => c && c.id !== data.chatId);
                 if (chatToUpdate) {
                     const seenByArray = Array.isArray(chatToUpdate.seenBy) ? chatToUpdate.seenBy : [];
                     const updatedChat = {
                         ...chatToUpdate,
                         lastMessage: data.text,
                         updatedAt: data.createdAt,
                         seenBy: seenByArray.filter((id) => id !== currentUser.id), // Mark as unread
                     };
                     // Increase notification count *only if* it was successfully marked unread
                     if (!updatedChat.seenBy.includes(currentUser.id)) {
                          console.log("[Chat.jsx] Increasing notification count for unread message in closed chat.");
                          increase(); // Use the increase function from the store
                     }
                     return [updatedChat, ...otherChats].sort((a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0));
                 }
                 return list; // Should not happen if chatExistsInList is true, but safe fallback
             });
          } else {
             // If it's a completely new chat we haven't seen before,
             // we should ideally fetch its details and add it to the list.
             // For now, just increase the count.
             console.warn("[Chat.jsx] Received message for a new chat not yet in list:", data.chatId);
             console.log("[Chat.jsx] Increasing notification count for new chat.");
             increase(); // Increase count for new chat message
             // TODO: Fetch new chat details and add to chatList state
          }
      }
      // --- 👆 END LOGIC FOR INCOMING MESSAGE ---
    };
    socket.on("getMessage", messageListener);


    // --- Cleanup ---
    return () => {
      console.log("[Chat.jsx] Socket Listeners cleaning up.");
      if (socket) {
         socket.off("userTyping", typingListener);
         socket.off("getMessage", messageListener);
      }
    };
    // Rerun if socket changes, the currently open chat changes, or the user changes
  }, [socket, chat, currentUser?.id, decrease, increase, chatList]); // Added increase and chatList


  // Update list when chats prop changes from parent (ChatPage)
  useEffect(() => {
      // Basic check: Only update if the prop is actually different
      if (chats && JSON.stringify(chats) !== JSON.stringify(chatList)) {
       setChatList(chats || []);
     } else if (!chats && chatList.length > 0) { // Handle prop becoming null/undefined
       setChatList([]);
     }
     // We don't want chatList itself as a dependency here, causes loops.
  }, [chats]);


  // Get receiver helper function
  const getReceiver = (chatToFind) => {
     if (!chatToFind || !Array.isArray(chatToFind.users)) return null;
     const currentUserId = currentUser?.id;
     if (!currentUserId) return null;
     return chatToFind.users.find((user) => user && user.id !== currentUserId);
  };

  // Filtered chats for search
  const filteredChats = useMemo(() => {
      const list = Array.isArray(chatList) ? chatList : []; // Ensure list is array
      if (!searchQuery) return list;
      return list.filter((c) => {
         if (!c) return false;
        const receiver = getReceiver(c);
        return receiver?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [chatList, searchQuery, currentUser?.id]);


  // Typing handler
  const handleTyping = (e) => {
      if (!socket || !chat) return;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
       socket.emit("typing", { chatId: chat.id, isTyping: true });
      typingTimeoutRef.current = setTimeout(() => {
         if(socket) socket.emit("typing", { chatId: chat.id, isTyping: false });
      }, 3000); // Send 'stopped typing' after 3 seconds of inactivity
  };

  // --- RETURN JSX ---
  return (
    <div className="chat">
      {/* Chat List (Left) */}
      <div className={`chat-list-container ${chat ? "mobile-hidden" : ""}`}>
           <div className="list-header">
           <h1>Messages</h1>
           <div className="search-bar">
             <img src="/search.png" alt="Search" />
             <input type="search" placeholder="Search chats..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
         </div>
         <div className="chat-list">
           {currentUser && Array.isArray(filteredChats) && filteredChats.map((c) => {
              if (!c || !c.id) return null;
             const receiver = getReceiver(c);
             if (!receiver) { return null; }

             const isOnline = onlineUsers.includes(receiver.id);
             const seenByArray = Array.isArray(c.seenBy) ? c.seenBy : [];
             const isUnread = !seenByArray.includes(currentUser.id);

             return (
               <div
                 className={`chat-list-item ${isUnread ? "unread" : ""} ${ chat?.id === c.id ? "active" : "" }`}
                 key={c.id}
                 onClick={() => handleOpenChat(c.id)}
               >
                 <div className="avatar-container">
                   <img src={receiver.avatar || "/noavatar.jpg"} alt={`${receiver.username}'s Avatar`} />
                   {isOnline && <div className="online-dot"></div>}
                 </div>
                 <div className="text-container">
                   <span>{receiver.username}</span>
                   <p>{c.lastMessage || 'No messages yet'}</p>
                 </div>
               </div>
             );
           })}
            {/* Show message if no chats */}
             {(!chatList || chatList.length === 0) && !searchQuery && <p className="no-chats-message">No conversations yet.</p>}
             {(chatList.length > 0 && filteredChats.length === 0 && searchQuery) && <p className="no-chats-message">No chats match '{searchQuery}'.</p>}
         </div>
      </div>

      {/* Chat Box (Right) */}
      <div className="chatBox">
        {chat ? (
          <>
              <div className="top">
              <div className="user">
                <button className="back-btn" onClick={() => setChat(null)}> <BackIcon /> </button>
                <div className="avatar-container">
                  <img src={getReceiver(chat)?.avatar || "/noavatar.jpg"} alt="" />
                  {getReceiver(chat) && onlineUsers.includes(getReceiver(chat)?.id) && (<div className="online-dot"></div>)}
                </div>
                <div className="user-details">
                  <span>{getReceiver(chat)?.username || 'User'}</span>
                  <p> {(getReceiver(chat) && onlineUsers.includes(getReceiver(chat)?.id)) ? "Online" : "Offline"} </p>
                </div>
              </div>
              <span className="close" onClick={() => setChat(null)}> X </span>
            </div>

            {chat.post && (
              <div className="chat-context">
                <img src={chat.post.images?.[0] || "/noimg.png"} alt="Property context" />
                <div className="context-details">
                  <p>{chat.post.title || 'Property Title'}</p>
                  <strong> ₹ {(chat.post.price || 0).toLocaleString("en-IN")} </strong>
                </div>
                {chat.post.id && (<Link to={`/${chat.post.id}`} className="view-btn"> View </Link>)}
              </div>
            )}

            <div className="center">
              {currentUser && Array.isArray(chat.messages) && chat.messages.map((message) => {
                 if (!message || !message.id) return null;
                 return (
                    <div className={ message.userId === currentUser.id ? "chatMessage own" : "chatMessage" } key={message.id}>
                      <p>{message.text}</p>
                      <span>{message.createdAt ? format(new Date(message.createdAt), "p") : ''}</span>
                    </div>
                 );
              })}
              {isTyping && ( <div className="chatMessage"><div className="typing-indicator"><span/><span/><span/></div></div> )}
              <div ref={messageEndRef}></div>
            </div>

            <form onSubmit={handleSubmit} className="bottom">
              <textarea name="text" placeholder="Type a message..." onChange={handleTyping} key={chat.id} />
              <button className="send-button" type="submit"> <SendIcon /> </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <h2>Start a Conversation</h2>
            <p> Select a chat from the left panel to view messages or initiate a new discussion about a property. </p>
            <div className="divider"></div>
          </div>
        )}
      </div>
    </div>
  );
}; // End ChatComponent logic

// Wrap with forwardRef and export
const Chat = forwardRef(ChatComponent);
export default Chat;

