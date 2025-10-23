import { useContext, useEffect, useState, useRef } from "react";
import { Link, useLoaderData, useNavigate, useLocation } from "react-router-dom";
import List from "../../components/list/List";
import Chat from "../../components/chat/Chat";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./profilePage.scss";

function ProfilePage() {
  const data = useLoaderData();
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [chats, setChats] = useState([]);
  const chatRef = useRef();

  // useEffect for processing post data
  useEffect(() => {
    const processPostData = async () => {
      try {
        const postData = await data.postResponse;
        const rawUserPosts = postData.data.userPosts;
        const rawSavedPosts = postData.data.savedPosts;
        const savedPostIds = new Set(rawSavedPosts.map((p) => p.id));
        const updatedUserPosts = rawUserPosts.map((post) => ({
          ...post,
          isSaved: savedPostIds.has(post.id),
        }));
        const updatedSavedPosts = rawSavedPosts.map((post) => ({
          ...post,
          isSaved: true,
        }));
        setUserPosts(updatedUserPosts);
        setSavedPosts(updatedSavedPosts);
      } catch (err) {
        console.log("Error resolving loader data:", err);
      }
    };
    processPostData();
  }, [data.postResponse]);

  // useEffect for loading and sorting initial chats
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const chatData = await data.chatResponse;

        // ✅ ADDED: Sort chats by the last update time
        const sortedChats = chatData.data.sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        setChats(sortedChats);
      } catch (err) {
        console.log("Error resolving chat data:", err);
      }
    };
    fetchChatData();
  }, [data.chatResponse]);

  // useEffect to open chat from navigation state
  useEffect(() => {
    const chatToOpen = location.state?.newChat;
    if (chatToOpen && chatRef.current) {
      chatRef.current.openChat(chatToOpen.id, chatToOpen.receiver);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSavePost = async (post) => {
    const originalUserPosts = [...userPosts];
    const originalSavedPosts = [...savedPosts];

    const updatedUserPosts = userPosts.map((p) =>
      p.id === post.id ? { ...p, isSaved: !p.isSaved } : p
    );
    setUserPosts(updatedUserPosts);

    if (!post.isSaved) {
      setSavedPosts((prev) => [...prev, { ...post, isSaved: true }]);
    } else {
      setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
    }

    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setUserPosts(originalUserPosts);
      setSavedPosts(originalSavedPosts);
    }
  };

  // Naya (updated) code:
const handleSendMessage = async () => {
    if (!currentUser) {
        navigate("/login");
        return;
    }
    try {
        // Backend ko receiverId aur postId, dono bhejien
        const res = await apiRequest.post("/chats", { 
            receiverId: currentPost.userId,
            postId: currentPost.id // <-- Yeh zaroori hai
        });
        console.log("Chat created or found, navigating to profile/chat");
        // User ko seedha profile page par bhej dein (wahan chat list update ho jayegi)
        navigate("/profile"); 
    } catch (err) {
        console.error("Failed to start chat:", err);
        alert("Failed to start chat. Please try again.");
    }
};
  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img
                src={currentUser.avatar || "/noavatar.jpg"}
                alt="User avatar"
              />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              E-mail: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My List</h1>
            <Link to="/add">
              <button>Create New Post</button>
            </Link>
          </div>
          <List
            posts={userPosts}
            onSave={handleSavePost}
            onSendMessage={handleSendMessage}
          />
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <List
            posts={savedPosts}
            onSave={handleSavePost}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Chat ref={chatRef} chats={chats} setChats={setChats} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;