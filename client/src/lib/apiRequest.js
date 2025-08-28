import axios from "axios";

const apiRequest = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // This uses your Vercel variable
  withCredentials: true,
});

export default apiRequest;
