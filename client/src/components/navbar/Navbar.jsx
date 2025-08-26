// src/components/navbar/Navbar.jsx

import { useContext, useState, useEffect } from "react"; // 👈 Import useEffect
import "./navbar.scss";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  // Use the actions and state from the store
  const fetchNotifications = useNotificationStore((state) => state.fetch); // Assuming this is the correct action
  const number = useNotificationStore((state) => state.number);

  // FIX: Fetch the initial count inside useEffect to prevent infinite loops
  useEffect(() => {
    if (currentUser && fetchNotifications) {
      fetchNotifications();
    }
  }, [currentUser, fetchNotifications]); // Re-run if user or fetch function changes

  return (
    <nav>
      <div className="left">
        <NavLink to="/" className="logo">
          <img src="/logo.png" alt="" />
          <span>PropertyHuntt</span>
        </NavLink>
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/agents">Agents</NavLink>
      </div>

      <div className="right">
        {currentUser ? (
          <div className="user">
            <img src={currentUser.avatar || "/noavatar.jpg"} alt="" />
            <span>{currentUser.username}</span>
            <NavLink to="/profile" className="profile">
              {/* This will show the real-time number */}
              {number > 0 && <div className="notification">{number}</div>}
              <span>Profile</span>
            </NavLink>
          </div>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "activeLink" : "")}
            >
              Sign in
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? "activeLink" : "")}
            >
              Sign up
            </NavLink>
          </>
        )}

        <div className="menuIcon">
          <img
            src="/menu.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>

        <div className={open ? "menu active" : "menu"}>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/agents">Agents</NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "activeLink" : "")}
          >
            Sign in
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) => (isActive ? "activeLink" : "")}
          >
            Sign up
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;