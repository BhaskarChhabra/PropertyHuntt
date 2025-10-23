import React from "react";
import "./homePage.scss";

// --- CORRECTED IMPORT PATHS ---
// Path changed from ../ to ../../ to correctly navigate from src/routes/homePage/ to src/
import HeroSection from "../../components/HeroSection/HeroSection";
import StatsSection from "../../components/StatsSection/StatsSection";
//import FeaturedProperties from "../../components/FeaturedProperties/FeaturedProperties";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import FeaturesSection from "../../components/FeaturesSection/FeaturesSection";
import HighlightsSection from "../../components/HighlightsSection/HighlightsSection";
function HomePage() {
  return (
    <div className="homePage">
      <div className="textContainer">
        <div className="wrapper">
          
          {/* 1. Hero Section */}
          <HeroSection />
          <HighlightsSection />
          {/* 2. Stats Section */}
          <StatsSection />

          {/* 3. Featured Properties (This component fetches its own data) */}
          {/* <FeaturedProperties /> */}

          {/* 4. How It Works */}
          <HowItWorks />

          {/* 5. Features/Excellence Section */}
          <FeaturesSection />

        </div>
      </div>

      {/* This is hidden via SCSS */}
      <div className="imgContainer">
        <img src="/bg.png" alt="Modern property background" />
      </div>
    </div>
  );
}

export default HomePage;
