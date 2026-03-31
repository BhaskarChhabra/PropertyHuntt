import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT - BRAND */}
        <div className="footer-brand">
          <h2>PropertyHuntt</h2>
          <p>
            Find your dream property with ease. We bring transparency,
            trust, and technology together.
          </p>
        </div>

        {/* LINKS */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>

        {/* CONTACT */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📍 Lucknow, India</p>
          <p>📞 +91 98765 43210</p>
          <p>✉️ support@propertyhuntt.com</p>
        </div>

      </div>

      {/* BOTTOM STRIP */}
      <div className="footer-bottom">
        <p>© 2026 PropertyHuntt. All rights reserved.</p>
      </div>

    </footer>
  );
};

export default Footer;