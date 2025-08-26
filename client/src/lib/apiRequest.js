import axios from "axios";

const apiRequest = axios.create({
  baseURL: "http://localhost:8800/api", // ✅ Use your backend API URL
  withCredentials: true, // ✅ Keep if you're using cookies/session auth
});

export default apiRequest;
