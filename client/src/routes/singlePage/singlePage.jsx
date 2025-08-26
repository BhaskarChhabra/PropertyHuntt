import "./singlePage.scss";
import Slider from "../../components/slider/Slider";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
      return; // Stop execution if not logged in
    }
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.error("DETAILED BACKEND ERROR:", err.response?.data);
      setSaved((prev) => !prev);
    }
  };

  // --- NEW FUNCTION TO HANDLE SENDING A MESSAGE ---
  const handleSendMessage = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    try {
      // Create a new chat with the post's owner
      // The backend addChat function uses 'receiverId'
      await apiRequest.post("/chats", { receiverId: post.userId });
      // Navigate to the profile page to see all chats
      navigate("/profile");
    } catch (err) {
      console.log("Error creating chat:", err);
    }
  };

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <h1>{post.title}</h1>
                <div className="address">
                  <img src="/pin.png" alt="" />
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar || "/noavatar.png"} alt="" />
                <span>{post.user.username}</span>
              </div>
            </div>
            <div
              className="bottom"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          {/* ... all your other JSX for features ... */}
          {/* The code below is the final part of this section */}
          <p className="title">Location</p>
          <div className="mapContainer">
            <Map items={[post]} />
          </div>
          <div className="buttons">
            {/* --- THIS BUTTON IS NOW FIXED --- */}
            <button onClick={handleSendMessage}>
              <img src="/chat.png" alt="" /> Send a Message
            </button>
            <button
              onClick={handleSave}
              style={{ backgroundColor: saved ? "#fece51" : "white" }}
            >
              <img src="/save.png" alt="" />{" "}
              {saved ? "Place Saved" : "Save the Place"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;