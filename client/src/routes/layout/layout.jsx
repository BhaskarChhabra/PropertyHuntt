import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer"; // ✅ ADD THIS
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

/* MAIN LAYOUT (USED EVERYWHERE) */
function Layout() {
  return (
    <div className="layout">

      {/* NAVBAR */}
      <div className="navbar">
        <Navbar />
      </div>

      {/* PAGE CONTENT */}
      <div className="content">
        <Outlet />
      </div>

      {/* FOOTER (NOW GLOBAL) */}
      <Footer />

    </div>
  );
}

/* AUTH WRAPPER (NO DUPLICATE LAYOUT NOW) */
function RequireAuth() {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) return <Navigate to="/login" />;

  return <Outlet />; // ✅ IMPORTANT FIX
}

export { Layout, RequireAuth };