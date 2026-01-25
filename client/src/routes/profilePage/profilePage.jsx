import { useContext, useEffect, useState, useRef } from "react";
import { Link, useLoaderData, useNavigate, useLocation } from "react-router-dom";
import List from "../../components/list/List";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import "./profilePage.scss";

// --- 👇 Confirmation Modal Component ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <p>{message}</p>
        <div className="modalActions">
          <button onClick={onConfirm} className="confirmButton">Yes, Delete</button>
          <button onClick={onCancel} className="cancelButton">Cancel</button>
        </div>
      </div>
    </div>
  );
};
// --- 👆 End Confirmation Modal Component ---


function ProfilePage() {
  const data = useLoaderData();
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  // --- 👇 State for Delete Confirmation Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null); // Store the ID of the post to delete
  // --- 👆 End Modal State ---

  const savedListRef = useRef(null);

  // useEffect for processing post data
  useEffect(() => {
    const processPostData = async () => {
      // ... (keep existing data processing logic) ...
       if (data.postResponse) {
        try {
          const postData = await data.postResponse;
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

  // useEffect for scrolling
  useEffect(() => {
    // ... (keep existing scrolling logic) ...
     if (location.state?.scrollTo === "saved" && savedListRef.current) {
      savedListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  const handleSavePost = async (post) => {
    // ... (keep existing handleSavePost logic) ...
     const originalUserPosts = [...userPosts];
    const originalSavedPosts = [...savedPosts];

    const updatedUserPosts = userPosts.map((p) =>
      p.id === post.id ? { ...p, isSaved: !p.isSaved } : p
    );
    const updatedSavedPostsList = savedPosts.map((p) =>
       p.id === post.id ? { ...p, isSaved: !p.isSaved } : p
    );

     if (userPosts.find(p => p.id === post.id)) {
       setUserPosts(updatedUserPosts);
     }
     if (savedPosts.find(p => p.id === post.id)) {
       setSavedPosts(updatedSavedPostsList);
     }

    if (!post.isSaved) {
       if (!savedPosts.find(p => p.id === post.id)) {
           setSavedPosts((prev) => [...prev, { ...post, isSaved: true }]);
       } else {
           setSavedPosts(updatedSavedPostsList);
       }
    } else {
      setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
    }

    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log("Save error:", err);
      setUserPosts(originalUserPosts);
      setSavedPosts(originalSavedPosts);
    }
  };


  const handleSendMessage = async (post) => {
    // ... (keep existing handleSendMessage logic) ...
     if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!post || !post.userId) {
      console.error("Post data is missing or invalid for sending message.");
      return;
    }

    try {
      const res = await apiRequest.post("/chats", {
        receiverId: post.userId,
        postId: post.id,
      });

      if (res.data) {
        const chatData = res.data;
        console.log("Chat created/found, navigating to /chat with state:", chatData);

        navigate("/chat", {
          state: {
            openChat: chatData
          }
        });
      } else {
         console.error("Failed to get chat data from API response.");
         alert("Could not start chat. Please try again.");
      }

    } catch (err) {
      console.error("Failed to start chat:", err);
      alert("Failed to start chat. Please try again or check your connection.");
    }
  };

  const handleLogout = async () => {
    // ... (keep existing handleLogout logic) ...
     try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  // --- 👇 MODIFIED: This function now OPENS the modal ---
  const handleDeletePost = (postId) => {
     console.log("Requesting delete for post:", postId);
     setPostToDelete(postId); // Set the ID of the post to be deleted
     setIsModalOpen(true);    // Open the modal
  };
  // --- 👆 END MODIFICATION ---

  // --- 👇 ADDED: Function to CONFIRM deletion ---
  const confirmDelete = async () => {
     if (!postToDelete) return; // Exit if no post ID is set

     const postId = postToDelete;
     setIsModalOpen(false); // Close modal immediately
     setPostToDelete(null); // Clear the ID

     // Optimistic UI update
     const originalUserPosts = [...userPosts];
     setUserPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));

     try {
       await apiRequest.delete(`/posts/${postId}`);
       console.log(`Post ${postId} deleted successfully.`);
       setSavedPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
     } catch (err) {
       console.error(`Failed to delete post ${postId}:`, err);
       // Revert UI on error
       setUserPosts(originalUserPosts);
       alert("Failed to delete post. Please try again.");
     }
  };
  // --- 👆 END CONFIRM function ---

  // --- 👇 ADDED: Function to CANCEL deletion ---
  const cancelDelete = () => {
     setIsModalOpen(false);
     setPostToDelete(null);
  };
  // --- 👆 END CANCEL function ---

  if (!currentUser) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profilePage">
       {/* --- 👇 Render Confirmation Modal --- */}
       <ConfirmationModal
          isOpen={isModalOpen}
          message="Are you sure you want to delete this post? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
       />
       {/* --- 👆 End Modal Render --- */}

      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            {/* ... (user info content) ... */}
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
            onDelete={handleDeletePost} // Pass the function that opens the modal
            showDelete={true}
          />
          <div className="title" ref={savedListRef}>
            <h1>Saved List</h1>
          </div>
          <List
            posts={savedPosts}
            onSave={handleSavePost}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

