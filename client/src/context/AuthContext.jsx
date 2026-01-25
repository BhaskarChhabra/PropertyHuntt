import { createContext, useEffect, useState } from "react";
import apiRequest from "../lib/apiRequest"; // Make sure this is your axios/fetch wrapper

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const updateUser = (data) => {
    setCurrentUser(data);
  };

  // Fetch current user from backend /auth/me (works for Google and classic login)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await apiRequest.get("/auth/me"); // Should include cookies!
        if (res.data) setCurrentUser(res.data);
      } catch (err) {
        setCurrentUser(null); // Not logged in
      }
    };
    fetchCurrentUser();
    // Only runs on first mount: Google login redirect, classic login, or reload.
  }, []);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
