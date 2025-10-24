import { useContext, useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import List from "../../components/list/List";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./profilePage.scss";

function ProfilePage() {
  const data = useLoaderData();
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  // useEffect for processing post data
  useEffect(() => {
    const processPostData = async () => {
      if (data.postResponse) {
        try {
          const postData = await data.postResponse;
          // Ensure data exists before accessing properties
          const rawUserPosts = postData.data?.userPosts || [];
          const rawSavedPosts = postData.data?.savedPosts || [];

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
      }
    };
    processPostData();
  }, [data.postResponse]);


  const handleSavePost = async (post) => {
    // ... (keep existing handleSavePost logic)
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

  // --- 👇 UPDATED FUNCTION ---
  const handleSendMessage = async (post) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!post || !post.userId) {
      console.error("Post data is missing or invalid for sending message.");
      return; // Prevent API call if post data is bad
    }

    try {
      // Create/find the chat
      const res = await apiRequest.post("/chats", {
        receiverId: post.userId,
        postId: post.id,
      });

      // --- 👇 PASS CHAT INFO TO /chat route ---
      if (res.data) {
        // Assuming the API returns the chat object upon creation/retrieval
        const chatData = res.data;
        console.log("Chat created/found, navigating to /chat with state:", chatData);

        // Pass the entire chat object or necessary details
        navigate("/chat", {
          state: {
            openChat: chatData // Pass the chat object
          }
        });
      } else {
         console.error("Failed to get chat data from API response.");
         alert("Could not start chat. Please try again.");
      }
      // --- 👆 END PASSING INFO ---

    } catch (err) {
      console.error("Failed to start chat:", err);
      // Use a more user-friendly error message if possible
      alert("Failed to start chat. Please try again or check your connection.");
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    // 👇 --- FIXED SYNTAX HERE ---
    } catch (err) { // Added opening brace {
      console.log(err);
    } // Moved closing brace } here
    // 👆 --- END FIX ---
  };

  // Ensure currentUser is loaded before rendering sensitive info
  if (!currentUser) {
    return <div>Loading profile...</div>; // Or a spinner component
  }

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
            onSendMessage={handleSendMessage} // Pass updated function
          />
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <List
            posts={savedPosts}
            onSave={handleSavePost}
            onSendMessage={handleSendMessage} // Pass updated function
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

