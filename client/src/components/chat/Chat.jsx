import { useContext, useEffect, useRef, useState } from "react";
import "./chat.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { SocketContext } from "../../context/SocketContext";
import { useNotificationStore } from "../../lib/notificationStore";
import { format, isToday, isYesterday } from "date-fns";

function Chat({ chats }) {
  const [chatList, setChatList] = useState(chats);
  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef();
  const decrease = useNotificationStore((state) => state.decrease);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "p");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleOpenChat = async (id, receiver) => {
    try {
      // First, find the chat in our local state
      const chatInList = chatList.find((c) => c.id === id);

      // ✅ FIX: If the chat is unread, call the read() function
      if (chatInList && !chatInList.seenBy.includes(currentUser.id)) {
        read(id);
        decrease();
      }

      // Then, proceed with fetching the full chat data and joining the socket room
      const res = await apiRequest("/chats/" + id);
      if (socket) {
        socket.emit("joinChat", id);
      }
      setChat({ ...res.data, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const text = formData.get("text");
    if (!text || !chat) return;

    try {
      const res = await apiRequest.post("/messages/" + chat.id, { text });
      setChat((prev) => ({ ...prev, messages: [...prev.messages, res.data] }));
      e.target.reset();

      setChatList((prev) => {
        const otherChats = prev.filter((c) => c.id !== chat.id);
        const updatedChat = {
          ...prev.find((c) => c.id === chat.id),
          lastMessage: text,
        };
        return [updatedChat, ...otherChats];
      });

      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        chatId: chat.id,
        message: res.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleGetMessage = (data) => {
      if (data.userId === currentUser.id) {
        return;
      }

      setChat((prevChat) => {
        if (prevChat && prevChat.id === data.chatId) {
          // Note: We are keeping the read() call here for when a message arrives in an already open chat
          read(prevChat.id); 
          return { ...prevChat, messages: [...prevChat.messages, data] };
        }
        return prevChat;
      });

      setChatList((prevChats) => {
        const chatExists = prevChats.some((c) => c.id === data.chatId);
        if (!chatExists) {
          return prevChats;
        }

        const otherChats = prevChats.filter((c) => c.id !== data.chatId);
        const updatedChat = {
          ...prevChats.find((c) => c.id === data.chatId),
          lastMessage: data.text,
          seenBy: [],
        };
        return [updatedChat, ...otherChats];
      });
    };

    socket.on("getMessage", handleGetMessage);

    return () => {
      socket.off("getMessage", handleGetMessage);
    };
  }, [socket, currentUser]);

  useEffect(() => {
    setChatList(chats);
  }, [chats]);

  const read = async (chatId) => {
    try {
      // This function correctly updates the chatList state, which causes the UI to re-render
      await apiRequest.put("/chats/read/" + chatId);
      setChatList((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, seenBy: [...c.seenBy, currentUser.id] }
            : c
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {chatList?.map((c) => (
          <div
            className="message"
            key={c.id}
            style={{
              backgroundColor: c.seenBy.includes(currentUser.id)
                ? "white"
                : "#fecd514e",
            }}
            onClick={() => handleOpenChat(c.id, c.receiver)}
          >
            <img src={c.receiver?.avatar || "/noavatar.jpg"} alt="" />
            <span>{c.receiver?.username}</span>
            <p>{c.lastMessage}</p>
          </div>
        ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver?.avatar || "noavatar.jpg"} alt="" />
              {chat.receiver?.username}
            </div>
            <span className="close" onClick={() => setChat(null)}> X </span>
          </div>
          <div className="center">
            {chat.messages.map((message) => (
              <div
                className="chatMessage"
                style={{
                  alignSelf:
                    message.userId === currentUser.id ? "flex-end" : "flex-start",
                  textAlign:
                    message.userId === currentUser.id ? "right" : "left",
                }}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{formatTimestamp(message.createdAt)}</span>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>
          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text"></textarea>
            <button>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;