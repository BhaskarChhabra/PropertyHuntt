import React from 'react';
import { Link } from "react-router-dom";
import './FeatureSection.scss'; // Make sure this is linked
import { FiTrendingUp } from "react-icons/fi"; // <-- IMPORT THE ICON HERE

function FeaturesSection() {
    return (
        <div className="excellence-section">

            {/* --- 1. PRE-TITLE --- */}
            <h3 className="section-pre-title">✨ OUR PREMIUM FEATURES ✨</h3>

            {/* --- 2. MAIN TITLE --- */}
            <h2 className="section-title-main">
                Why Choose <span>Excellence</span>
            </h2>

            {/* --- 3. SUBTITLE --- */}
            <p className="excellence-subtitle">
                Experience unparalleled service with our innovative approach to finding your <span>perfect home</span>.
            </p>

            {/* --- 4. STATS --- */}
            <div className="excellence-stats">
                <span>🏆 Award Winning Service</span>
                <span>💹 98% Success Rate</span>
                <span>• Trusted by 10K+ Families</span>
            </div>

            {/* --- 5. CARDS --- */}
            <div className="feature-cards-grid">
                {/* ... Your four feature cards go here ... */}
                <div className="feature-card">
                    <span className="card-number">01</span>
                    <div className="card-icon chat-icon">💬</div>
                    <h3>Direct Communication</h3>
                    <p>Get instant responses from our experienced agents through our real-time chat system.</p>
                    <Link to="/chat" className="explore-link">Explore Feature &rarr;</Link>
                </div>
                <div className="feature-card">
                    <span className="card-number">02</span>
                    <div className="card-icon security-icon">🛡️</div>
                    <h3>Verified Properties</h3>
                    <p>Every property is thoroughly inspected and verified to ensure quality and authenticity.</p>
                    <Link to="/list" className="explore-link">Explore Feature &rarr;</Link>
                </div>
                <div className="feature-card">
                    <span className="card-number">03</span>
                    <div className="card-icon home-icon">🏠</div>
                    <h3>Quality First</h3>
                    <p>We maintain high standards for all properties, ensuring you get the best value.</p>
                    <Link to="/about" className="explore-link">Explore Feature &rarr;</Link>
                </div>
                <div className="feature-card">
                    <span className="card-number">04</span>
                    <div className="card-icon family-icon">👪</div>
                    <h3>Family Focused</h3>
                    <p>Find homes that perfectly match your family needs and lifestyle preferences.</p>
                    <Link to="/list?family=true" className="explore-link">Explore Feature &rarr;</Link>
                </div>
            </div>

            {/* --- 6. NEW CTA SECTION --- */}
            <div className="cta-section">
                {/* --- ICON REPLACED --- */}
                <div className="cta-icon">
                    <FiTrendingUp /> 
                </div>
                {/* --- END ICON REPLACEMENT --- */}
                <h2 className="cta-title">
                    Ready to Find Your <span>Dream Home?</span>
                </h2>
                <p className="cta-description">
                    Join thousands of satisfied customers who found their perfect home with our premium features and personalized service.
                </p>
                <div className="cta-buttons">
                    <Link to="/list" className="cta-button primary">Browse Properties &rarr;</Link>
                    <Link to="/contact" className="cta-button secondary">Contact Expert &rarr;</Link>
                </div>
                <div className="cta-stats">
                    <span>🟢 10,000+ Happy Families</span>
                    <span>🔵 5-Star Average Rating</span>
                    <span>🟣 24/7 Premium Support</span>
                </div>
            </div>
            {/* --- END CTA SECTION --- */}

        </div> // End .excellence-section
    );
}

export default FeaturesSection;