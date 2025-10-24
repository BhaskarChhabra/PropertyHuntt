import { useLoaderData, useLocation } from "react-router-dom"; // 👈 Add useLocation
import Chat from "../../components/chat/Chat";
import "./chatPage.scss";
import { Suspense, useEffect, useState, useRef } from "react"; // 👈 Add useRef

function ChatPage() {
  const data = useLoaderData();
  const location = useLocation(); // 👈 Get location object
  const [chats, setChats] = useState([]);
  const chatRef = useRef(); // 👈 Ref to access Chat component's function

  // Fetch initial chats from loader
  useEffect(() => {
    const fetchChatData = async () => {
      if (data.chatResponse) {
        try {
          const chatData = await data.chatResponse;
          const sortedChats = chatData.data.sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });
          setChats(sortedChats);
        } catch (err) {
          console.log("Error resolving chat data:", err);
        }
      }
    };
    fetchChatData();
  }, [data.chatResponse]);

  // --- 👇 ADDED: useEffect to check navigation state ---
  useEffect(() => {
    const chatToOpen = location.state?.openChat; // Check for 'openChat' in state

    if (chatToOpen && chatRef.current) {
      console.log("ChatPage: Received chat to open from state:", chatToOpen);
      // Call the function exposed by the Chat component
      chatRef.current.openSpecificChat(chatToOpen.id); 

      // Clear the state after opening to prevent re-opening on refresh
      window.history.replaceState({}, document.title); 
    }
  }, [location.state]); // Run when location state changes
  // --- 👆 END ADDED useEffect ---

  return (
    <div className="chatPage">
      <Suspense fallback={<p>Loading chats...</p>}>
        {/* Pass the ref to the Chat component */}
        <Chat ref={chatRef} chats={chats} /> 
      </Suspense>
    </div>
  );
}

export default ChatPage;
