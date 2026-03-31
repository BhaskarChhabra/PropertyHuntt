import React from "react";
import "./contact.css";

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-wrapper">

        <div className="contact-card">

          {/* LEFT SIDE */}
          <div className="contact-left">
            <div className="contact-image-box">
              <img
                src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b"
                alt="contact"
              />
              <div className="contact-overlay-text">
                <h2>Let’s Talk</h2>
                <p>We’re here to help you grow 🚀</p>
              </div>
            </div>

            <div className="contact-info">
              <div className="contact-info-item">
                <span>📍</span>
                <p>Lucknow, India</p>
              </div>

              <div className="contact-info-item">
                <span>📞</span>
                <p>+91 98765 43210</p>
              </div>

              <div className="contact-info-item">
                <span>✉️</span>
                <p>support@example.com</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="contact-right">
            <h1>Contact Us</h1>
            <p className="contact-subtitle">We’d love to hear from you</p>

            <form className="contact-form">
              <div className="contact-input-group">
                <input type="text" required />
                <label>Name</label>
              </div>

              <div className="contact-input-group">
                <input type="email" required />
                <label>Email</label>
              </div>

              <div className="contact-input-group">
                <textarea required rows="4"></textarea>
                <label>Message</label>
              </div>

              <button type="submit" className="contact-btn">
                Send Message →
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;