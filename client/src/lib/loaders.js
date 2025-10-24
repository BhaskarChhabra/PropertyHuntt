import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";

export const singlePageLoader = async ({ request, params }) => {
  const res = await apiRequest("/posts/" + params.id);
  return res.data;
};
export const listPageLoader = async ({ request, params }) => {
  const query = request.url.split("?")[1];
  const postPromise = apiRequest("/posts?" + query);
  return defer({
    postResponse: postPromise,
  });
};

// --- 👇 HERE ARE THE CHANGES ---

// 1. MODIFIED: This loader now ONLY gets posts.
export const profilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts");
  return defer({
    postResponse: postPromise,
    // chatResponse has been removed
  });
};

// 2. NEW: This loader is just for the chat page.
export const chatPageLoader = async () => {
  const chatPromise = apiRequest("/chats");
  return defer({
    chatResponse: chatPromise, // The chatPromise lives here now
  });
};
