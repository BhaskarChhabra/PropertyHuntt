import React from "react";
import "./about.css";

const About = () => {
  return (
    <div className="about-wrapper">

      {/* HERO SECTION */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>About PropertyHuntt</h1>
          <p>
            Helping you find not just houses, but places you can truly call home.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="about-container">

        {/* LEFT TEXT */}
        <div className="about-text">
          <h2>Who We Are</h2>
          <p>
            PropertyHuntt is a modern real estate platform built to simplify the
            way people search, compare, and invest in properties. We combine
            technology with real-world insights to deliver the best experience.
          </p>

          <p>
            Whether you're buying your first home or investing in premium
            properties, we make the journey smooth, transparent, and efficient.
          </p>

          {/* STATS */}
          <div className="about-stats">
            <div>
              <h3>500+</h3>
              <p>Properties Listed</p>
            </div>
            <div>
              <h3>120+</h3>
              <p>Happy Clients</p>
            </div>
            <div>
              <h3>4.8⭐</h3>
              <p>Customer Rating</p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
            alt="about"
          />
        </div>

      </div>

      {/* TEAM SECTION */}
      <div className="team-section">
        <h2>Our Vision</h2>
        <p>
          To become the most trusted real estate platform where technology meets
          transparency and customer satisfaction.
        </p>
      </div>

    </div>
  );
};

export default About;