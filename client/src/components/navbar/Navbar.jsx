import { useContext, useState, useEffect } from "react";
import "./navbar.scss";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";

// Importing icons for the menu to match the look
import { IoIosSettings } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
// 👇 --- 1. IMPORTED THE NEW ICON ---
import { IoHeartOutline, IoPaperPlaneOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const fetchNotifications = useNotificationStore((state) => state.fetch);
  const number = useNotificationStore((state) => state.number);

  useEffect(() => {
    if (currentUser && fetchNotifications) {
      fetchNotifications();
    }
  }, [currentUser, fetchNotifications]);

  const propertiesSearchUrl = "/list";

  // --- Toggle state for the User Dropdown Menu (Zaroori) ---
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Example user data to match the image structure
  const userName = currentUser?.username || "abcd";
  const userEmail = currentUser?.email || "bhaskarchhabra2004@gmail.com";
  // Avatar initials ko image ke hisaab se "A" ya current user ke initial se set karein
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <nav>
      {/* 1. LEFT SECTION (LOGO) */}
      <div className="left">
        <NavLink to="/" className="logo">
          <div className="logo-icon-wrap">🏠</div>
          <div className="logo-text-wrap">
            <span>BuildEstate</span>
            <span className="premiumProperties">Premium Properties</span>
          </div>
        </NavLink>
      </div>

      {/* 2. CENTER SECTION (NAV LINKS) */}
      <div className="center">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Home
        </NavLink>
        <NavLink
          to={propertiesSearchUrl}
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Properties
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          About Us
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Contact
        </NavLink>
      </div>

      {/* 3. RIGHT SECTION (ACTIONS) */}
      <div className="right">
        {/* AI Property Hub Link - EXACT styling */}
        <NavLink to="/ai-property-hub" className="aiHubLink">
          AI Property Hub
          <span className="newBadge">NEW</span>
        </NavLink>

        {currentUser ? (
          <div className="userActions">
            
            {/* 👇 --- 2. REPLACED BELL WITH CHAT ICON LINK --- */}
            {/* Chat/Messages Icon */}
            <NavLink to="/chat" className="notificationBell">
              <span className="bellIcon">
                {/* Using IoPaperPlaneOutline icon */}
                <IoPaperPlaneOutline size={24} /> 
              </span>
              {number > 0 && <div className="notificationCount">{number}</div>}
            </NavLink>
            {/* 👆 --- END OF CHANGE --- */}

            {/* User Avatar/Dropdown Trigger (EXACT PILL SHAPE) */}
            <div
              className={`userPill ${isUserMenuOpen ? "open" : ""}`}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              {/* Avatar Placeholder/Image */}
              <div className="avatarPlaceholder">{userInitials}</div>

              <div className="userNameAndMember">
                <span className="username">{userName}</span>
                <span className="premiumMemberTag">Premium Member</span>
              </div>

              <span className="dropdownArrow">
                {isUserMenuOpen ? (
                  <HiOutlineChevronUp size={20} />
                ) : (
                  <HiOutlineChevronDown size={20} />
                )}
              </span>
            </div>

            {/* User Dropdown Menu (Exact Match) */}
            {isUserMenuOpen && (
              <div className="userMenuDropdown">
                <div className="userInfo">
                  <div className="avatarPlaceholder big">{userInitials}</div>
                  <div className="details">
                    <h4>{userName}</h4>
                    <p>{userEmail}</p>
                    <span className="premiumTag">👑 Premium</span>
                  </div>
                </div>

                {/* Menu Items */}
                <NavLink to="/profile" className="menuItem">
                  <FaRegUser size={18} /> My Profile
                </NavLink>
                <NavLink to="/saved" className="menuItem">
                  <IoHeartOutline size={18} /> Saved Properties
                </NavLink>
                <NavLink to="/settings" className="menuItem">
                  <IoIosSettings size={18} /> Settings
                </NavLink>

                <NavLink to="/logout" className="signOut menuItem">
                  <IoMdLogOut size={18} /> Sign out
                </NavLink>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Login/Register links */}
            <NavLink to="/login" className="loginLink">
              Sign in
            </NavLink>
            <NavLink to="/register" className="registerLink">
              Sign up
            </NavLink>
          </>
        )}

        {/* MOBILE MENU ICON */}
        <div className="menuIcon">
          <img
            src="/menu.png"
            alt="menu"
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <div className={open ? "menu active" : "menu"}>
          {/* ... mobile links ... */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
