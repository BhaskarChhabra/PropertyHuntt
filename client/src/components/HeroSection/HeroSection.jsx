import React from 'react';
// import { Link } from "react-router-dom"; // Iski zaroorat nahi thi
import SearchBar from "../searchBar/SearchBar"; // Asli SearchBar import kiya

// --- MOCKUP SearchBar Component (Ab yeh hata diya gaya hai) ---
// --------------------------------------------------------

function HeroSection() {
    return (
        <div className="hero-section">
            <div className="trust-badge">
                Trusted by 50,000+ families ⭐⭐⭐⭐⭐
            </div>
            <h1 className="title">
                {/* Highlighted text is inline for visual design match */}
                <span className="highlight-text">Find Your Perfect</span><br>
                </br> Dream Home
            </h1>
            <p className="hero-subtitle">
                Discover exceptional properties in prime locations with our 
                <strong style={{ color: '#4F46E5' }}> AI-powered search </strong> and expert guidance.
            </p>
            
            {/* Yahan par asli SearchBar component use kiya */}
            <SearchBar />
        </div>
    );
}

export default HeroSection;