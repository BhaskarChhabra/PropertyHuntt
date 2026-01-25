import { useContext, useState, useEffect } from "react";
import "./navbar.scss"; // Styles will be updated in the next file
import { NavLink, useNavigate } from "react-router-dom"; // Added useNavigate
import { AuthContext } from "../../context/AuthContext";
import { useNotificationStore } from "../../lib/notificationStore";
import apiRequest from "../../lib/apiRequest"; // Import apiRequest for logout

// Importing icons
import { IoIosSettings, IoMdLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { IoHeartOutline, IoPaperPlaneOutline } from "react-icons/io5";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";

function Navbar() {
  const [open, setOpen] = useState(false); // Mobile menu state
  const { currentUser, updateUser } = useContext(AuthContext); // Added updateUser
  const navigate = useNavigate(); // Hook for navigation

  const fetchNotifications = useNotificationStore((state) => state.fetch);
  const number = useNotificationStore((state) => state.number);

  // Fetch notifications on mount if user is logged in
  useEffect(() => {
    if (currentUser && fetchNotifications) {
      fetchNotifications();
    }
  }, [currentUser, fetchNotifications]);

  const propertiesSearchUrl = "/list"; // Define properties search URL

  // State for user dropdown menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // User details for display
  const userName = currentUser?.username || "Guest";
  const userEmail = currentUser?.email || "";
  const userInitials = userName.charAt(0).toUpperCase();

  // Function to close the dropdown when a link is clicked
  const handleLinkClick = () => {
    setIsUserMenuOpen(false);
  };

  // --- 👇 ADDED: Logout Handler ---
  const handleLogout = async () => {
     handleLinkClick(); // Close the dropdown first
     try {
       await apiRequest.post("/auth/logout");
       updateUser(null); // Clear user in context
       navigate("/"); // Navigate to home page
       console.log("Logged out successfully");
     } catch (err) {
       console.error("Logout failed:", err);
       // Optional: Show an error message to the user
     }
  };
  // --- 👆 END Logout Handler ---

  return (
    <nav>
      {/* 1. LEFT SECTION (LOGO) */}
      <div className="left">
        <NavLink to="/" className="logo">
          {/* Updated Icon Wrapper */}
          <div className="logo-icon-wrap">
            <img src="/logo.png" alt="Logo Icon" /> {/* Assuming you have logo.png in public */}
          </div>
          <div className="logo-text-wrap">
            <span>PropertyHuntt</span> {/* Updated Name */}
            <span className="premiumProperties">Premium Properties</span>
          </div>
        </NavLink>
      </div>

      {/* 2. CENTER SECTION (NAV LINKS) */}
      <div className="center">
        <NavLink
          to="/"
          end // Ensures '/' only matches the home page exactly
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
          to="/about" // Example link
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          About Us
        </NavLink>
        <NavLink
          to="/contact" // Example link
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          Contact
        </NavLink>
      </div>

      {/* 3. RIGHT SECTION (ACTIONS) */}
      <div className="right">
        {/* --- AI Property Hub Link REMOVED --- */}

        {currentUser ? (
          <div className="userActions">
            {/* Chat/Messages Icon */}
            <NavLink to="/chat" className="notificationBell" title="Messages">
              <span className="bellIcon">
                <IoPaperPlaneOutline size={24} />
              </span>
              {/* Show count only if > 0 */}
              {number > 0 && <div className="notificationCount">{number}</div>}
            </NavLink>

            {/* User Avatar/Dropdown Trigger */}
            <div
              className={`userPill ${isUserMenuOpen ? "open" : ""}`}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
            >
              <div className="avatarPlaceholder">{userInitials}</div>
              <div className="userNameAndMember">
                <span className="username">{userName}</span>
                {/* Conditionally show Premium Member */}
                {/* Assuming currentUser has a property like isPremium */}
                {currentUser?.isPremium && (
                     <span className="premiumMemberTag">Premium Member</span>
                )}
              </div>
              <span className="dropdownArrow">
                {isUserMenuOpen ? (
                  <HiOutlineChevronUp size={20} />
                ) : (
                  <HiOutlineChevronDown size={20} />
                )}
              </span>
            </div>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="userMenuDropdown">
                <div className="userInfo">
                  <div className="avatarPlaceholder big">{userInitials}</div>
                  <div className="details">
                    <h4>{userName}</h4>
                    <p>{userEmail}</p>
                    {/* Conditionally show Premium Tag */}
                    {currentUser?.isPremium && (
                        <span className="premiumTag">👑 Premium</span>
                    )}
                  </div>
                </div>

                {/* Menu Items */}
                <NavLink to="/profile" className="menuItem" onClick={handleLinkClick}>
                  <FaRegUser size={18} /> My Profile
                </NavLink>
                <NavLink
                  to="/profile"
                  className="menuItem"
                  state={{ scrollTo: "saved" }}
                  onClick={handleLinkClick}
                >
                  <IoHeartOutline size={18} /> Saved Properties
                </NavLink>
                {/* Example Settings Link */}
                <NavLink to="/profile/update" className="menuItem" onClick={handleLinkClick}>
                  <IoIosSettings size={18} /> Settings
                </NavLink>

                {/* Logout Button */}
                 <button onClick={handleLogout} className="signOut menuItem">
                   <IoMdLogOut size={18} /> Sign out
                 </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Login/Register links */}
            <NavLink to="/login" className="loginLink">Sign in</NavLink>
            <NavLink to="/register" className="registerLink">Sign up</NavLink>
          </>
        )}

        {/* MOBILE MENU ICON */}
        <div className="menuIcon" onClick={() => setOpen((prev) => !prev)}>
          {/* Simple three-line menu icon using divs */}
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <div className={open ? "menu active" : "menu"}>
          {/* Add links similar to desktop, closing menu onClick */}
           <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
           <NavLink to={propertiesSearchUrl} onClick={() => setOpen(false)}>Properties</NavLink>
           <NavLink to="/about" onClick={() => setOpen(false)}>About Us</NavLink>
           <NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink>
           <hr/> {/* Separator */}
           {currentUser ? (
             <>
               <NavLink to="/profile" state={{ scrollTo: "saved" }} onClick={() => setOpen(false)}>Saved Properties</NavLink>
               <NavLink to="/profile" onClick={() => setOpen(false)}>Profile</NavLink>
               <button onClick={() => { handleLogout(); setOpen(false); }} className="mobileLogout">Sign out</button>
             </>
           ) : (
             <>
               <NavLink to="/login" onClick={() => setOpen(false)}>Sign in</NavLink>
               <NavLink to="/register" onClick={() => setOpen(false)}>Sign up</NavLink>
             </>
           )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

